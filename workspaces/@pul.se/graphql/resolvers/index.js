import { streamSession, live, streams, stream, regenerateKey, updateName, vods, deleteStream } from './streams';

export default {
  Query: {
    streams,
    stream,
    streamSession,
    live,
    vods
  },
  Mutation: {
    updateName,
    regenerateKey,
    deleteStream
  }
};
