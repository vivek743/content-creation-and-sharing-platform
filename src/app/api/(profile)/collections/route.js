import { ConnectDB } from "@/database";
import { generateAccessToken, verifyToken } from "@/lib/token";
import { Collection } from "@/models/collections.models";
import { Image } from "@/models/images.models";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

await ConnectDB();

//Add data to collection
export const POST = async (req) => {
  try {
    const { postId, type } = await req.json();

    const accessTokenValue = cookies().get("accessToken")?.value;
    const refreshTokenValue = cookies().get("refreshToken")?.value;

    if (!refreshTokenValue) {
      return NextResponse.json(
        { success: false, error: "Missing refresh token" },
        { status: 401 }
      );
    }

    //Check if refresh token is expired
    try {
      verifyToken(refreshTokenValue);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Session expired" },
        { status: 401 }
      );
    }

    let userId;

    try {
      const decodedAccess = verifyToken(accessTokenValue);
      userId = decodedAccess?.id;
    } catch (error) {
      const decodedRefresh = verifyToken(refreshTokenValue);
      userId = decodedRefresh?.id;
      if (userId) {
        const newAccessToken = generateAccessToken({ id: userId }, "1h");
        cookies().set("accessToken", newAccessToken);
      }
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Invalid tokens" },
        { status: 401 }
      );
    }

    const existingCollection = await Collection.findOne({
      userId,
    });

    if (!existingCollection) {
      const userCollection = new Collection({
        userId,
        data: [type === "image" ? { imageID: postId } : { videoID: postId }],
        visibility: true,
      });

      await userCollection.save();

      return NextResponse.json({
        success: true,
        message: "Data added to collection",
        status: 200,
      });
    }

    const isPostExists = existingCollection?.data.some(
      (data) =>
        data?.imageID?.toString() === postId.toString() ||
        data?.videoID?.toString() === postId.toString()
    );

    if (isPostExists) {
      const filteredCollection = existingCollection?.data?.filter((post) => {
        post.imageID !== postId || post.videoID !== postId;
      });

      existingCollection.data = filteredCollection;
      await existingCollection?.save();

      return NextResponse.json({
        success: true,
        message: "Data removed from collection",
        status: 200,
      });
    }

    existingCollection?.data.push(
      type === "image" ? { imageID: postId } : { videoID: postId }
    );

    await existingCollection?.save();

    return NextResponse.json(
      {
        success: true,
        message: "Data added to collection",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
};

//Get collection data
export const GET = async () => {
  try {
    const accessTokenValue = cookies().get("accessToken")?.value;
    const refreshTokenValue = cookies().get("refreshToken")?.value;

    if (!refreshTokenValue) {
      return NextResponse.json(
        { success: false, error: "Missing refresh token" },
        { status: 401 }
      );
    }

    //Check if refresh token is expired
    try {
      verifyToken(refreshTokenValue);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Session expired" },
        { status: 401 }
      );
    }

    let userId;

    try {
      const decodedAccess = verifyToken(accessTokenValue);
      userId = decodedAccess?.id;
    } catch (error) {
      const decodedRefresh = verifyToken(refreshTokenValue);
      userId = decodedRefresh?.id;
      if (userId) {
        const newAccessToken = generateAccessToken({ id: userId }, "1h");
        cookies().set("accessToken", newAccessToken);
      }
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Invalid tokens" },
        { status: 401 }
      );
    }

    const collections = await Collection.find({ userId });

    const imageIDs = collections.flatMap((collection) =>
      collection.data.map((data) => data.imageID)
    );

    const images = await Image.find({ _id: { $in: imageIDs } });

    return NextResponse.json(
      { success: true, data: { collections, images } },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
};

export const DELETE = async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("id");

    const accessTokenValue = cookies().get("accessToken")?.value;
    const refreshTokenValue = cookies().get("refreshToken")?.value;

    if (!refreshTokenValue) {
      return NextResponse.json(
        { success: false, error: "Missing refresh token" },
        { status: 401 }
      );
    }

    //Check if refresh token is expired
    try {
      verifyToken(refreshTokenValue);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Session expired" },
        { status: 401 }
      );
    }

    let userId;

    try {
      const decodedAccess = verifyToken(accessTokenValue);
      userId = decodedAccess?.id;
    } catch (error) {
      const decodedRefresh = verifyToken(refreshTokenValue);
      userId = decodedRefresh?.id;
      if (userId) {
        const newAccessToken = generateAccessToken({ id: userId }, "1h");
        cookies().set("accessToken", newAccessToken);
      }
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Invalid tokens" },
        { status: 401 }
      );
    }

    const existingCollection = await Collection.findOne({ userId });
    if (!existingCollection) {
      return NextResponse.json(
        { success: false, error: "Collection not found" },
        { status: 404 }
      );
    }

    const isPostExists = existingCollection?.data?.some(
      (post) =>
        post.imageID.toString() === postId.toString() || post.videoID === postId
    );

    if (!isPostExists) {
      return NextResponse.json(
        { success: false, error: "Post not found in collection" },
        { status: 404 }
      );
    }

    existingCollection.data = existingCollection.data?.filter(
      (post) => post.imageID.toString() !== postId.toString()
    );

    await existingCollection?.save();

    return NextResponse.json(
      {
        success: true,
        message: "Post removed from collection!",
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
};
