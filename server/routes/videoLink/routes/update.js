const _ = require('lodash');

module.exports = ({ data, log }) => ({
  method: 'PATCH',
  path: '/videoLink/:id',
  handler: async (request, reply) => {
    const videoLinkToUpdate = await data.getById(request.params.id);

    const updateNeeded = !_.isEqual(
      _.omit(videoLinkToUpdate, [
        'subjectId',
        'createdOn',
        'createdById',
        'createdByName',
      ]),
      _.omit(request.body, ['userId', 'username']),
    );

    if (updateNeeded) {
      const counterToUpdate = await data.counter.getById(videoLinkToUpdate.subjectId);
      const newCounter = {
        userId: request.body.userId,
        username: request.body.username,
        ...counterToUpdate,
      };

      try {
        await data.update(videoLinkToUpdate, request.body);
        await data.counter.update(counterToUpdate, newCounter);
      } catch (e) {
        log.error(e);
        throw new Error(e);
      }
    } else {
      log.warn('VideoLink update not needed.');
    }

    return reply.send('ok');
  },
  schema: {
    params: {
      id: { type: 'string' },
    },
    body: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        link: { type: 'string' },
        userId: { type: 'string' },
        username: { type: 'string' },
      },
      required: [
        'id',
        'title',
        'link',
        'userId',
        'username',
      ],
    },
    response: {
      '2xx': {
        type: 'string',
      },
    },
  },
});
