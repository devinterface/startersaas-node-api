import * as express from "express";
import { wrap } from "../../common/exceptions.js";
import authorizeRequest from "../../middlewares/authorizeRequest.middleware.js";
import ROLE from "../users/role.model.js";
import teamController from "./team.controller.js";

export default express
  .Router()
  .get("/", [wrap(authorizeRequest([ROLE.ADMIN])), wrap(teamController.index)]) // DONE
  .get("/:id", [
    wrap(authorizeRequest([ROLE.ADMIN])),
    wrap(teamController.byId),
  ]) // DONE
  .post("/", [
    wrap(authorizeRequest([ROLE.ADMIN])),
    wrap(teamController.create),
  ]) // DONE
  .put("/:id", [
    wrap(authorizeRequest([ROLE.ADMIN])),
    wrap(teamController.update),
  ]) // DONE
  .delete("/:id", [
    wrap(authorizeRequest([ROLE.ADMIN])),
    wrap(teamController.delete),
  ]) // DONE
  .put("/:id/add-user/:userId", [
    wrap(authorizeRequest([ROLE.ADMIN])),
    wrap(teamController.addUser),
  ]) // DONE
  .put("/:id/remove-user/:userId", [
    wrap(authorizeRequest([ROLE.ADMIN])),
    wrap(teamController.removeUser),
  ]);
