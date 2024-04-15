// "use strict";

const treeNode = require("../routes/tree-node");

/**
 * treess controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::tree-node.tree-node",
  ({ strapi }) => ({
    async getdata(ctx) {
      try {
        const data = await strapi.entityService.findMany(
          "api::tree-node.tree-node",
          {
            fields: ["name"],
            populate: {
              parent: {
                fields: ["name"],
              },
            },
          }
        );

        const treeData = createTree(data);
        return treeData;
      } catch (error) {
        ctx.body = error;
      }
    },

    async createNode(ctx) {
      try {
        // @ts-ignore
        const { data } = ctx.request.body;
        console.log("New node data:", data);
        console.log("Parent ID:", data.parentId);
        const newNode = await strapi.entityService.create(
          "api::tree-node.tree-node",
          {
            data: {
              name: data.text,
              parent: data.parentId,
            },
          }
        );
        console.log(newNode);
        return newNode;
      } catch (error) {
        return ctx.badRequest("Failed to create node");
      }
    },

    async deleteNode(ctx) {
      try {
        const nodeId = ctx.params.id;
        console.log(nodeId);
        await this.deleteChildren(nodeId); // Delete children recursively
        const deletedNode = await strapi.entityService.delete(
          "api::tree-node.tree-node",
          nodeId
        );
        console.log(deletedNode);
        return { success: true };
      } catch (error) {
        return ctx.badRequest("Failed to delete node");
      }
    },

    async deleteChildren(nodeId) {
      try {
        const childNodes = await strapi.entityService.findMany(
          "api::tree-node.tree-node",
          {
            filters: {
              parent: {
                id: {
                  // @ts-ignore
                  $eq: nodeId,
                },
              },
            },
          }
        );

        // Recursively delete each child node
        console.log("childNodes", childNodes);
        for (const childNode of childNodes) {
          // @ts-ignore
          await this.deleteChildren(childNode.id);
          await strapi.entityService.delete(
            "api::tree-node.tree-node",
            childNode.id
          );
        }
      } catch (error) {
        console.error("Error deleting child nodes:", error);
        throw error;
      }
    },

    async getAvailableNodes(ctx) {
      const clickedNodeId = ctx.params.id;
      console.log(clickedNodeId);
      try {
        const allNodes = await strapi.entityService.findMany(
          "api::tree-node.tree-node",
          {
            fields: ["name"],
            populate: {
              parent: {
                fields: ["name"],
              },
            },
          }
        );

        const treeD = createTree(allNodes);
        // console.log("Tree:", treeD);

        const isDescendant = (currNode, parentId) => {
          // console.log("Checking node:", currNode);
          if (currNode.id == parentId) {
            // console.log("Node is the clicked node:", currNode.id);
            return true;
          } else if (currNode.children && currNode.children.length > 0) {
            for (const child of currNode.children) {
              if (isDescendant(child, parentId)) {
                return true;
              }
            }
          }

          console.log("Node is not a descendant of clicked node.");
          return false;
        };

        const collectNodes = (treeData, clickedNodeId) => {
          const filteredNodes = [];

          filteredNodes.push({ id: -1, name: "None" });

          // If the clicked node is "None", return the clicked node itself
          if (clickedNodeId == -1) {
            const clickedNode = treeData.find((node) => node.id == -1);
            if (clickedNode) {
              return [clickedNode];
            }
            return [];
          }
          const collect = (node) => {
            const newNode = { ...node };
            if (
              node.id != clickedNodeId &&
              !isDescendant(node, clickedNodeId)
            ) {
              filteredNodes.push(newNode);
            }
            if (node.children && node.children.length > 0) {
              const filteredChildren = [];
              for (const child of node.children) {
                if (
                  child.id != clickedNodeId &&
                  !isDescendant(child, clickedNodeId)
                ) {
                  const filteredChild = collect(child);
                  if (filteredChild) {
                    filteredChildren.push(filteredChild);
                  }
                }
              }
              newNode.children = filteredChildren;
            }
            return newNode.children.length > 0 ? newNode : null;
          };

          for (const node of treeData) {
            if (node.id == clickedNodeId) {
              // If the clicked node is found, collect its siblings
              const parentNode = node.parent;
              if (parentNode && parentNode.children) {
                for (const sibling of parentNode.children) {
                  if (sibling.id != clickedNodeId) {
                    const filteredSibling = { ...sibling, children: [] };
                    filteredNodes.push(filteredSibling);
                  }
                }
              }
            } else {
              // Collect nodes recursively excluding the clicked node and its descendants
              collect(node);
            }
          }

          return filteredNodes;
        };

        // Usage:
        const filteredNodes = collectNodes(treeD, clickedNodeId);
        console.log("Filtered Nodes:", filteredNodes);

        console.log("Filtered Nodes:", filteredNodes);
        ctx.send(filteredNodes);
      } catch (error) {
        ctx.throw(500, "Error fetching available nodes");
      }
    },

    async updateNode(ctx) {
      try {
        // @ts-ignore
        const { data } = ctx.request.body;
        console.log("data", data);
        await strapi.entityService.update(
          "api::tree-node.tree-node",
          data.nodeId,
          {
            data: {
              parent: data.newParentNodeId,
            },
          }
        );
        ctx.send({ message: "Node moved successfully" });
      } catch (error) {
        ctx.throw(500, "Error moving node");
      }
    },
  })
);

function createTree(data) {
  const map = new Map();
  const roots = [];
  data.forEach((nodeData) => {
    const { id, name, parent } = nodeData;
    const node = { id, name, children: [] };

    if (!map.has(id)) {
      map.set(id, node);
    } else {
      map.get(id).name = name;
    }

    if (!parent) {
      roots.push(map.get(id));
    }
  });

  data.forEach((nodeData) => {
    const { id, parent } = nodeData;
    if (parent && map.has(parent.id)) {
      map.get(parent.id).children.push(map.get(id));
    }
  });

  return roots;
}
