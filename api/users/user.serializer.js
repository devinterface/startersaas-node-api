import BaseSerializer from "../../serializers/base.serializer.js";

class UserSerializer extends BaseSerializer {
  constructor() {
    super();
    this.properties = [
      "_id",
      "name",
      "surname",
      "email",
      "language",
      "role",
      "active",
      "accountID",
      "accountOwner",
      "teams",
      "createdAt",
      "updatedAt",
    ];
  }
}

export default new UserSerializer();
