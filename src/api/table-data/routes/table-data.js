"use strict";

/**
 * table-data router
 */

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/table-datas/getData",
      handler: "table-data.getData",
    },
    {
      method: "POST",
      path: "/table-datas/addData",
      handler: "table-data.addData",
    },
    {
      method: "DELETE",
      path: "/table-datas/:id",
      handler: "table-data.deleteData",
    },
    {
      method: "PUT",
      path: "/table-datas/:id",
      handler: "table-data.updateData",
    },
  ],
};
