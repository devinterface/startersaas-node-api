import BaseSerializer from "../../serializers/base.serializer.js";

class TeamSerializer extends BaseSerializer {
  constructor() {
    super();
    this.properties = [
      "_id",
      "name",
      "code",
      "users",
      "createdAt",
      "updatedAt",
    ];
  }
}

export default new TeamSerializer();
