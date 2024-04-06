// "use strict";

/**
 * treess controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::tree-node.tree-node",
  ({ strapi }) => ({
    async getdata(ctx, next) {
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

    async updateNode(ctx) {
     
      try {
         // @ts-ignore
      const { data } = ctx.request.body;
        console.log("data",data);
         await strapi.entityService.update(
          "api::tree-node.tree-node",
          data.nodeId,
          {
            data:{
              parent: data.newParentNodeId
          }}
         )
        ctx.send({ message: 'Node moved successfully' });
      } catch (error) {
        ctx.throw(500, 'Error moving node');
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
