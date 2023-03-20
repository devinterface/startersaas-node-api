import ApplicationError from "../../libs/errors/application.error.js";
import BaseService from "../../services/base.service.js";
import userService from "../users/user.service.js";
import Team from "./team.model.js";

class TeamsService extends BaseService {
  getModel() {
    return Team;
  }

  async create(data, accountId) {
    try {
      let team = await this.oneBy({
        code: data.code,
        accountId: accountId,
      });
      if (team) {
        return new ApplicationError(
          "code is invalid or already taken",
          {},
          500
        );
      }
      const newTeam = new Team(data);
      await newTeam.save();
      return newTeam.toObject();
    } catch (e) {
      return new ApplicationError(e.message, {}, 500);
    }
  }

  async update(id, accountId, data) {
    return this.getModel().findOneAndUpdate(
      { _id: id, accountId: accountId },
      data,
      { new: true }
    );
  }

  async delete(id, accountId) {
    let team = await this.oneBy({
      _id: id,
      accountId: accountId,
    });
    if (!team) {
      throw new ApplicationError("Team is not present", {}, 500);
    }
    for (const user of team.users) {
      await this.removeUser(id, accountId, user._id);
    }

    return this.getModel().findOneAndDelete({ _id: id, accountId: accountId });
  }

  async addUser(id, accountId, userId) {
    let team = await this.oneBy({
      _id: id,
      accountId: accountId,
    });
    if (!team) {
      throw new ApplicationError("Team is not present", {}, 500);
    }
    let users = team.users;

    let user = await userService.findById(userId);
    if (!user) {
      throw new ApplicationError("User is not present", {}, 500);
    }
    users.push({
      _id: user._id,
      email: user.email,
    });

    const uniqueUsers = users.reduce((accumulator, user) => {
      if (!accumulator.some((u) => u._id.equals(user._id))) {
        accumulator.push(user);
      }
      return accumulator;
    }, []);

    let updatedTeam = await this.update(id, accountId, {
      users: uniqueUsers,
    });

    let teams = user.teams;
    teams.push({
      _id: team._id,
      name: team.name,
      code: team.code,
    });
    const uniqueTeams = teams.reduce((accumulator, user) => {
      if (!accumulator.some((u) => u._id.equals(user._id))) {
        accumulator.push(user);
      }
      return accumulator;
    }, []);

    await userService.update(user._id, accountId, {
      teams: uniqueTeams,
    });

    return updatedTeam.toObject();
  }

  async removeUser(id, accountId, userId) {
    let team = await this.oneBy({
      _id: id,
      accountId: accountId,
    });
    if (!team) {
      throw new ApplicationError("Team is not present", {}, 500);
    }

    let user = await userService.findById(userId);
    if (!user) {
      throw new ApplicationError("User is not present", {}, 500);
    }

    let filteredUsers = team.users.filter((user) => {
      return user._id != userId;
    });

    let updatedTeam = await this.update(id, accountId, {
      users: filteredUsers,
    });

    let filteredTeams = user.teams.filter((team) => {
      return team._id != id;
    });

    await userService.update(user._id, accountId, {
      teams: filteredTeams,
    });

    return updatedTeam.toObject();
  }
}

export default new TeamsService();
