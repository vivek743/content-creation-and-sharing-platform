"use client";
import {
  Button,
  Skeleton,
  Modal,
  ModalContent,
  ModalBody,
  useDisclosure,
  Progress,
  Image,
  Chip,
  SelectItem,
  Select,
  Spinner,
} from "@nextui-org/react";
import { Poppins } from "next/font/google";
import { useEffect, useState } from "react";
import { HiOutlineDownload } from "react-icons/hi";
import { MdDone } from "react-icons/md";

const litePoppins = Poppins({
  weight: "500",
  subsets: ["latin"],
});

const litePoppins2 = Poppins({
  weight: "300",
  subsets: ["latin"],
});

function page() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFileSelected, setIsFileSelected] = useState(false);
  const [fileData, setFileData] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [uploadClicked, setUploadClicked] = useState(false);
  const [resolution, setResolution] = useState(new Set([]));
  const [model, setModel] = useState(new Set([]));
  const [isGenerateVideo, setIsGenerateVideo] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      if (!isLoading) {
        setIsLoading(true);
      }
    }, 2000);
  }, [isLoading]);

  const handleFileDrop = async (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    const size = file.size / 1024 / 1024; // Convert bytes to MB
  
    if (!file) {
      alert("No file detected. Please drop a valid file.");
      return;
    }
  
    if (size > 100) {
      alert("File size should be less than 100MB");
    } else {
      setIsFileSelected(true);
      setFileData(file);
      await uploadVideo(file); // Call the upload function immediately
    }
  };
  
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    const size = file.size / 1024 / 1024; // Convert bytes to MB
  
    if (!file) {
      alert("No file selected. Please choose a valid file.");
      return;
    }
  
    if (size > 100) {
      alert("File size should be less than 100MB");
    } else {
      setIsFileSelected(true);
      setFileData(file);
      await uploadVideo(file); // Call the upload function immediately
    }
  };

  const uploadVideo = async (file) => {
    try {
      if (!file) {
        console.error("No file provided for upload.");
        return null;
      }
  
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "intellect");
      formData.append("public_id", `videos/videoUpscaler/${Date.now()}`);
  
      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`,
          {
            method: "POST",
            body: formData, // FormData handles the Content-Type automatically
          }
        );
  
        const data = await response.json();
  
        if (response.ok) {
          setUploadedVideo(data.secure_url);
          console.log("Video uploaded successfully:", data.secure_url);
        } else {
          console.error("Error uploading video:", data.error?.message || "Unknown error");
        }
  
        setUploadClicked(false);
      } catch (error) {
        console.error("Error uploading video:", error.message);
      }
    } catch (error) {
      console.error("Error preparing file for upload:", error.message);
    }
  };
  

  const handleOpen = async () => {
    onOpen();
  };

  const download = async (data) => {
    const downloadUrl = data;

    try {
      const response = await fetch(downloadUrl);
      const blob = await response.blob();

      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = "download";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      URL.revokeObjectURL(downloadLink.href);
    } catch (error) {
      console.error("Error downloading content:", error);
    }
  };

  const upscaleImage = async () => {
    try {
      setIsGenerateVideo(true);
      const response = await fetch("/api/videos/video-upscale", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          video: uploadedVideo,
          model: model?.currentKey,
          resolution: resolution?.currentKey,
        }),
      });

      const { success, data, error } = await response.json();
      if (success) {
        setGeneratedVideo(data);
      } else {
        console.log(error);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <>
      <div className="image-upscaler flex flex-col items-center fadein sm:ml-[120px] md:ml-[320px] mr-0 sm:mr-4 p-4">
        <div className="top w-3/4 flex flex-col items-center mt-6">
          <Chip
            color="warning"
            variant="dot"
            className={`${litePoppins2.className} py-4 mt-2 mb-4 text-md px-2 bg-[#120f0f9a] shadow-xl`}
          >
            AI VIDEO UPSCALER
          </Chip>
          <p
            className={`${litePoppins.className} w-3/4 text-center text-[3.8rem]`}
          >
            Upscale your low-quality videos with{" "}
            <span className="bg-gradient-to-r from-gray-300 to-blue-600 text-transparent bg-clip-text font-bold">
              Intellect.AI
            </span>
          </p>
          <p
            className={`${litePoppins2.className} text-lg w-2/3 text-center mt-4 text-gray-300`}
          >
            Upgrade video quality effortlessly. Transform low-resolution footage
            into high-definition brilliance with advanced AI technology.
          </p>
          <Button
            color="primary"
            variant="shadow"
            className={`${litePoppins.className} p-6 text-lg mt-8 mb-20`}
            onClick={handleOpen}
          >
            Get Started
          </Button>
          <Skeleton isLoaded={isLoading} className="rounded-lg w-fit">
            <div className="video-demo p-2 rounded-xl bg-gradient-to-r from-blue-900 via-pink-200 to-blue-800">
              <video
                width="2560"
                height="1440"
                autoPlay
                loop
                preload="none"
                className="rounded-xl shadow-xl"
                muted
              >
                <source src="/video upscale/demo.mp4" type="video/mp4" />
              </video>
            </div>
          </Skeleton>
        </div>
        <div className="bottom flex flex-col justify-center items-center mt-20"></div>
      </div>
      <Modal
        size="2xl"
        placement="center"
        backdrop="blur"
        isDismissable={false}
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setUploadedVideo(null);
          setUploadClicked(false);
          setIsFileSelected(false);
          setFileData(null);
          setResolution(null);
          setModel(null);
          setGeneratedVideo(null);
          setIsGenerateVideo(false);
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody
                className={`${litePoppins.className} max-h-[600px] overflow-scroll scrollbar-hide`}
              >
                <div className="upscale-body py-6 flex flex-col items-center justify-center">
                  {!uploadedVideo && (
                    <div className="left fadein flex flex-col items-center w-full px-6">
                      {!uploadClicked && (
                        <>
                          <div
                            className={`${litePoppins2.className} flex w-full items-center flex-col justify-center`}
                          >
                            <p className={`${litePoppins.className} text-xl`}>
                              Upload a video
                            </p>
                            <label
                              htmlFor="dropzone-file"
                              className="flex flex-col mt-6 items-center justify-center w-full h-64 border-2 border-gray-500 border-dashed rounded-lg cursor-pointer bg-none"
                            >
                              <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleFileDrop}
                                className="flex flex-col items-center justify-center pt-5 pb-6"
                              >
                                {!isFileSelected && (
                                  <>
                                    <svg
                                      className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                                      aria-hidden="true"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 20 16"
                                    >
                                      <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                                      />
                                    </svg>
                                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                      <span className="font-semibold">
                                        Click to upload
                                      </span>{" "}
                                      or drag and drop
                                    </p>
                                  </>
                                )}

                                {isFileSelected && !uploadClicked && (
                                  <div className="fadein flex flex-col items-center">
                                    <div className="tick p-2 w-fit rounded-full border-2 border-green-500">
                                      <MdDone
                                        fontSize={30}
                                        className="text-green-500"
                                      />
                                    </div>
                                    <p className="mt-3 text-center">
                                      File selected: {fileData.name}
                                    </p>
                                  </div>
                                )}
                              </div>
                              <input
                                onChange={handleFileChange}
                                id="dropzone-file"
                                type="file"
                                accept="video/mp4"
                                className="hidden"
                              />
                            </label>
                          </div>
                          <Button
                            color="primary"
                            isDisabled={!isFileSelected}
                            onClick={async () => {
                              setUploadClicked(true);
                              await uploadVideo(fileData);
                            }}
                            className={`${litePoppins.className} w-full mt-6`}
                          >
                            Upload
                          </Button>
                        </>
                      )}
                      {uploadClicked && (
                        <div className="flex fadein flex-col items-center w-full leading-10">
                          <p className={`${litePoppins.className} text-lg`}>
                            Your video is being uploaded...
                          </p>
                          <p
                            className={`${litePoppins2.className} text-gray-400`}
                          >
                            Please wait... this process may take a while.
                          </p>
                          <Progress
                            size="sm"
                            isIndeterminate
                            aria-label="Loading..."
                            className="max-w-md py-4"
                          />
                        </div>
                      )}
                    </div>
                  )}
                  {uploadedVideo && (
                    <div
                      className={`options fadein flex flex-col w-full items-center
                        justify-between gap-6`}
                    >
                      {!isGenerateVideo && (
                        <>
                          <div className="left mb-4">
                            <video
                              width="550"
                              height="550"
                              loop
                              autoPlay
                              muted
                              preload="none"
                              className="rounded-xl shadow-lg"
                            >
                              <source src={uploadedVideo} type="video/mp4" />
                            </video>
                          </div>
                          <div className="right w-[90%]">
                            <div className="one">
                              <p className={litePoppins.className}>
                                Choose video resolution
                              </p>
                              <Select
                                className={`${litePoppins2.className} py-2 w-full`}
                                label="Select resolution"
                                selectedKeys={resolution}
                                onSelectionChange={setResolution}
                              >
                                <SelectItem
                                  className={litePoppins2.className}
                                  key="FHD"
                                  value={"FHD"}
                                >
                                  FHD (1080p)
                                </SelectItem>
                                <SelectItem
                                  className={litePoppins2.className}
                                  key="2k"
                                  value={"2k"}
                                >
                                  2K (1440p)
                                </SelectItem>
                                <SelectItem
                                  className={litePoppins2.className}
                                  key="4k"
                                  value={"4k"}
                                >
                                  4K (2160p)
                                </SelectItem>
                              </Select>
                            </div>
                            <div className="two mt-3">
                              <p className={litePoppins.className}>
                                Choose model
                              </p>
                              <Select
                                className={`${litePoppins2.className} py-2 w-full`}
                                label="Select model"
                                selectedKeys={model}
                                onSelectionChange={setModel}
                              >
                                <SelectItem
                                  className={litePoppins2.className}
                                  key="RealESRGAN_x4plus"
                                  value={"RealESRGAN_x4plus"}
                                >
                                  RealESRGAN-4x-plus
                                </SelectItem>
                                <SelectItem
                                  className={litePoppins2.className}
                                  key="RealESRGAN_x4plus_anime_6B"
                                  value={"RealESRGAN_x4plus_anime_6B"}
                                >
                                  RealESRGAN-4x-plus-anime
                                </SelectItem>
                                <SelectItem
                                  className={litePoppins2.className}
                                  key="realesr-animevideov3"
                                  value={"realesr-animevideov3"}
                                >
                                  Anime v3
                                </SelectItem>
                              </Select>
                              <Button
                                color="primary"
                                onClick={upscaleImage}
                                isDisabled={
                                  resolution?.size === 0 || model?.size === 0
                                }
                                className={`${litePoppins.className} mt-4 w-full`}
                              >
                                Start Generating
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                      {isGenerateVideo && !generatedVideo && (
                        <div className="loading fadein w-full flex flex-col items-center justify-center">
                          <Spinner
                            label="Please wait! Your video is being upscaling..."
                            color="default"
                            labelColor="foreground"
                            className={`${litePoppins.className} text-lg text-center`}
                          />
                        </div>
                      )}
                      {generatedVideo && (
                        <>
                          <div className="fadein w-full flex flex-col items-center justify-center">
                            <p className={`${litePoppins.className} text-lg`}>
                              Your video is enhanced and upscaled!
                            </p>
                            <video
                              width="550"
                              height="550"
                              loop
                              autoPlay
                              muted
                              preload="none"
                              className="rounded-xl shadow-lg mt-4"
                            >
                              <source src={generatedVideo} type="video/mp4" />
                            </video>
                            <Button
                              onClick={() => download(generatedVideo)}
                              color="primary"
                              className="w-1/2 mt-4"
                            >
                              <HiOutlineDownload
                                fontSize={22}
                                className="text-white"
                              />
                              Download video
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

export default page;
