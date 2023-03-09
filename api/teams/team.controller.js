import _ from "lodash";
import AccountService from "../accounts/account.service.js";
import Team from "./team.model.js";
import TeamSerializer from "./team.serializer.js";
import TeamService from "./team.service.js";
import TeamValidator from "./team.validator.js";

class Controller {
  async index(req, res) {
    const teams = await TeamService.find({ accountId: req.user.accountId });
    return res.json(TeamSerializer.index(teams));
  }

  async byId(req, res) {
    const team = await TeamService.oneBy({
      _id: req.params.id,
      accountId: req.user.accountId,
    });
    if (team) res.json(TeamSerializer.show(team));
    else res.status(404).end();
  }

  async create(req, res) {
    const me = req.user;
    const account = await AccountService.findById(me.accountId);
    const teams = await TeamService.find({ accountId: req.user.accountId });
    if (teams.length > Team.maxTeamsPerPlan(account.planType)) {
      return res.status(401).json({
        success: false,
        errors:
          "You have reached the maximum number of teams for your plan. Upgrade it to increase the number.",
      });
    }
    const errors = await TeamValidator.onCreate(req.body);
    if (errors) {
      return res.status(422).json({
        success: false,
        errors: errors.details,
      });
    }
    const teamData = _.pick(req.body, ["name", "code"]);
    teamData.code = _.kebabCase(teamData.code);
    const team = await TeamService.create(teamData, req.user.accountId);
    if (team) {
      return res.json(TeamSerializer.show(team));
    } else {
      return res.status(422).json({
        message: "Failed to save the team.",
      });
    }
  }

  async update(req, res) {
    const errors = await TeamValidator.onUpdate(req.body);
    if (errors) {
      return res.status(422).json({
        success: false,
        errors: errors.details,
      });
    }
    const teamData = _.pick(req.body, ["name"]);
    const team = await TeamService.update(
      req.params.id,
      req.user.accountId,
      teamData
    );

    if (team) {
      return res.json(TeamSerializer.show(team.toObject()));
    } else {
      return res.status(422).json({
        success: false,
        message: "Failed to update team.",
      });
    }
  }

  async delete(req, res) {
    try {
      await TeamService.delete(req.params.id, req.user.accountId);
      return res.json({
        deleted: true,
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Failed to delete team.",
      });
    }
  }

  async addUser(req, res) {
    let obj = {
      id: req.params.id,
      accountId: req.user.accountId,
      userId: req.params.userId,
    };
    const errors = await TeamValidator.onAddOrRemoveUser(obj);
    if (errors) {
      return res.status(422).json({
        success: false,
        errors: errors.details,
      });
    }

    try {
      let team = await TeamService.addUser(
        req.params.id,
        req.user.accountId,
        req.params.userId
      );
      if (team) {
        return res.json(TeamSerializer.show(team));
      }
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }

  async removeUser(req, res) {
    let obj = {
      id: req.params.id,
      accountId: req.user.accountId,
      userId: req.params.userId,
    };
    const errors = await TeamValidator.onAddOrRemoveUser(obj);
    if (errors) {
      return res.status(422).json({
        success: false,
        errors: errors.details,
      });
    }

    try {
      let team = await TeamService.removeUser(
        req.params.id,
        req.user.accountId,
        req.params.userId
      );
      if (team) {
        return res.json(TeamSerializer.show(team));
      }
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }
}
export default new Controller();
