import {
  StatusCodes,
  getStatusCode
} from 'http-status-codes'
import ApplicationError from '../libs/errors/application.error.js'

class BaseService {
  getModel () {
    throw Error('Should be overridden')
  }

  async find (params = {}, options = {}) {
    let queryModel = this.getModel()
    let searchQuery = Object.assign({}, params)

    const aggregate = options.aggregate
    if (aggregate) {
      const aggregation = await queryModel.aggregate(aggregate)
      const aggregationIds = aggregation.map(({ _id }) => _id)
      searchQuery = Object.assign({}, searchQuery, { _id: { $in: aggregationIds } })
    }

    queryModel = this.getModel().find(searchQuery)

    const populate = options.populate
    if (populate) {
      if (Array.isArray(populate)) {
        populate.forEach(population => {
          queryModel.populate(population)
        })
      } else {
        queryModel.populate(populate)
      }
    }

    return queryModel.exec()
  }

  async findById (id, options = {}) {
    const record = await this.byId(id, options)
    if (!record) {
      throw new ApplicationError(
        getStatusCode(StatusCodes.NOT_FOUND),
        'Record not found',
        StatusCodes.NOT_FOUND
      )
    }

    return record
  }

  async byId (id, options = {}) {
    let model = this.getModel().findById(id)

    const populate = options.populate
    if (populate) {
      if (Array.isArray(populate)) {
        populate.forEach(population => {
          model = model.populate(population)
        })
      } else {
        model.populate(populate)
      }
    }

    return model.exec()
  }

  async oneBy (q) {
    return this.getModel().findOne(q).exec()
  }

  async all () {
    return this.getModel().find({}).exec()
  }

  async paginate (limit, skip, searchOptions, options = {}) {
    let queryModel = this.getModel()
    let searchQuery = Object.assign({}, searchOptions)
    const aggregate = options.aggregate
    if (aggregate) {
      const aggregation = await queryModel.aggregate(aggregate)
      const aggregationIds = aggregation.map(({ _id }) => _id)
      searchQuery = Object.assign({}, searchQuery, { _id: { $in: aggregationIds } })
    }

    queryModel = queryModel.find(searchQuery).limit(limit).skip(skip).lean()

    const populate = options.populate
    if (populate) {
      if (Array.isArray(populate)) {
        populate.forEach(population => {
          queryModel.populate(population)
        })
      } else {
        queryModel.populate(populate)
      }
    }

    return Promise.all([
      queryModel.exec(),
      this.getModel().find(searchOptions).count({})
    ])
  }

  async create (data) {
    try {
      const record = new (this.getModel())(data)
      return record.save()
    } catch (error) {
      throw new ApplicationError(
        getStatusCode(StatusCodes.INTERNAL_SERVER_ERROR),
        error.message,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  async update (id, data) {
    return this.getModel().findOneAndUpdate({ _id: id }, data, { new: true })
  }

  async deleteLogically (id, deletedBy) {
    const result = await this.getModel().update({ _id: id }, { $set: { active: false, deletedBy: deletedBy } })
    return result
  }

  async delete (id) {
    return this.getModel().findOneAndDelete({ _id: id })
  }

  async deleteMany (filter) {
    return this.getModel().deleteMany(filter)
  }

  async remove (id) {
    const result = await this.getModel().findById({ _id: id })
    result.remove()
    return result
  }
}

export default BaseService
