"use strict";

/**
 * table-data controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::table-data.table-data",
  ({ strapi }) => ({
    async getData(ctx) {
      try {
        const data = await strapi.entityService.findMany(
          "api::table-data.table-data",
          { fields: ["FirstName", "LastName", "Email"] }
        );
        console.log(data);
        ctx.send(data);
      } catch (error) {
        console.log(error);
      }
    },

    async addData(ctx) {
      try {
        // @ts-ignore
        const { FirstName, LastName, Email } = ctx.request.body.data;
        const newData = await strapi.entityService.create(
          "api::table-data.table-data",
          {
            data: {
              FirstName,
              LastName,
              Email,
            },
          }
        );
        console.log(newData);
        ctx.send(newData);
      } catch (error) {
        return ctx.badRequest("Failed to create data");
      }
    },

    async deleteData(ctx) {
      try {
        const deleteId = ctx.params.id;
        const deletedData = await strapi.entityService.delete(
          "api::table-data.table-data",
          deleteId
        );
        console.log(deletedData);
        return { success: true };
      } catch (error) {
        return ctx.badRequest("Failed to delete data");
      }
    },

    async updateData(ctx) {
      try {
        const { id } = ctx.params;
        console.log(id);

        // @ts-ignore
        const { FirstName, LastName, Email } = ctx.request.body.data;

        // Check if all required fields are provided
        if (!FirstName || !LastName || !Email) {
          return ctx.badRequest("Missing required fields");
        }

        console.log(FirstName, LastName, Email);

        const updatedData = await strapi.entityService.update(
          "api::table-data.table-data",
          id,
          {
            data: {
              FirstName,
              LastName,
              Email,
            },
          }
        );
        console.log(updatedData);
        return ctx.send(updatedData);
      } catch (error) {
        return ctx.badRequest("Failed to create data");
      }
    },
  })
);
