import * as express from "express";
import { wrap } from "../../common/exceptions.js";
import authorizeRequest from "../../middlewares/authorizeRequest.middleware.js";
import ROLE from "../users/role.model.js";
import teamController from "./team.controller.js";

export default express
  .Router()
  .get("/", [wrap(authorizeRequest([ROLE.ADMIN])), wrap(teamController.index)])
  .get("/:id", [
    wrap(authorizeRequest([ROLE.ADMIN])),
    wrap(teamController.byId),
  ])
  .post("/", [
    wrap(authorizeRequest([ROLE.ADMIN])),
    wrap(teamController.create),
  ])
  .put("/:id", [
    wrap(authorizeRequest([ROLE.ADMIN])),
    wrap(teamController.update),
  ])
  .delete("/:id", [
    wrap(authorizeRequest([ROLE.ADMIN])),
    wrap(teamController.delete),
  ])
  .put("/:id/add-user/:userId", [
    wrap(authorizeRequest([ROLE.ADMIN])),
    wrap(teamController.addUser),
  ])
  .put("/:id/remove-user/:userId", [
    wrap(authorizeRequest([ROLE.ADMIN])),
    wrap(teamController.removeUser),
  ]);
