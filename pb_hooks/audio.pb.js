/// <reference path="../pb_data/types.d.ts" />

// Converts uploaded recordings before the record is saved, so the stored files and the response
// already contain the MP3s and the client can map them to tracks by upload order.
onRecordCreateRequest((e) => {
  require(`${__hooks}/audio.js`).saveWithTranscodedAudio(e);
}, "songs");

onRecordUpdateRequest((e) => {
  require(`${__hooks}/audio.js`).saveWithTranscodedAudio(e);
}, "songs");
