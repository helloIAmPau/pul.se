import { updateSettings, addStream, streams, stream, regenerateKey, updateName, deleteStream } from './streams';
import { vods, vod } from './vods';
import { lives, live } from './lives'

export default {
  Query: {
    streams,
    stream,
    lives,
    live,
    vods,
    vod
  },
  Mutation: {
    addStream,
    updateName,
    regenerateKey,
    updateSettings,
    deleteStream
  }
};
