module.exports = {
  routes: [
    {
      method: "GET",
      path: "/tree-nodes/treeformat",
      handler: "tree-node.getdata",
    },
    {
      method: "POST",
      path: "/tree-nodes/createTree",
      handler: "tree-node.createNode",
    },
    {
      method: "DELETE",
      path: "/tree-nodes/:id",
      handler: "tree-node.deleteNode",
    },
    {
      method: "PUT",
      path: "/tree-nodes/updateNode",
      handler: "tree-node.updateNode", 
    }
  ],
};
