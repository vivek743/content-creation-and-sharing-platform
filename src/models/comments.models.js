import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    imageID: {
      type: Schema.Types.ObjectId,
      ref: "Image",
    },
    videoID: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    comment: {
      type: String,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    reply: [
      {
        type: Schema.Types.ObjectId,
        ref: "Reply",
      },
    ],
  },
  { timestamps: true }
);

const replySchema = new Schema(
  {
    commentID: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    replyID: {
      type: Schema.Types.ObjectId,
      ref: "Reply",
    },
    userID: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    imageID: {
      type: Schema.Types.ObjectId,
      ref: "Image",
    },
    videoID: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    reply: {
      type: String,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export const Comment =
  mongoose.models.Comment || mongoose.model("Comment", commentSchema);

export const Reply =
  mongoose.models.Reply || mongoose.model("Reply", replySchema);
