"use client";
import { Poppins } from "next/font/google";
import {
  Button,
  Chip,
  Image,
  Modal,
  ModalContent,
  ModalBody,
  useDisclosure,
  Progress,
  Select,
  SelectItem,
  Spinner,
} from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import { PiFileImage } from "react-icons/pi";
import { HiOutlineDownload } from "react-icons/hi";

const litePoppins = Poppins({
  weight: "500",
  subsets: ["latin"],
});

const litePoppins2 = Poppins({
  weight: "300",
  subsets: ["latin"],
});

function page() {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [uploadedIMG, setUploadedIMG] = useState(null);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [ratio, setRatio] = useState(new Set([]));
  const [isGenerateClicked, setIsGenerateClicked] = useState(false);
  const [generatedIMG, setGeneratedIMG] = useState(null);

  useEffect(() => {
    if (isGenerateClicked && generatedIMG) {
      setIsGenerateClicked(false);
    }
  }, [isGenerateClicked, generatedIMG]);

  const MAX_FILE_SIZE = 500 * 1024;
  const handleFileUpload = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        alert("File size exceeds 500KB. Please choose a smaller file.");
      } else {
        setFile(selectedFile);
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.size > MAX_FILE_SIZE) {
        alert("File size exceeds 500KB. Please choose a smaller file.");
      } else {
        setFile(droppedFile);
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const uploadImage = async (file) => {
    try {
      if (!file) {
        throw new Error("No file provided for upload.");
      }
  
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "intellect"); 
      formData.append("public_id", `images/MagicExpand/${Date.now()}`);
  
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
  
      if (!response.ok) {
        throw new Error(`Failed to upload image. Status: ${response.status}`);
      }
  
      const data = await response.json();
      if (data?.secure_url) {
        setUploadedIMG(data.secure_url);
        console.log("Image uploaded successfully:", data.secure_url);
        return data.secure_url;
      } else {
        throw new Error("No secure_url found in Cloudinary response.");
      }
  
    } catch (error) {
      console.error("Error uploading image:", error.message);
    }
  };
  

  const expandImage = async () => {
    try {
      setIsGenerateClicked(true);
      const response = await fetch("/api/images/generative-fill", {
        method: "POST",
        body: JSON.stringify({
          image: uploadedIMG,
          ratio: ratio?.currentKey,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const { success, data, error } = await response.json();
      if (success) {
        setGeneratedIMG(data);
      } else {
        console.log(error);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const downloadImage = async () => {
    const imageUrl = generatedIMG;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = "download.png";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      URL.revokeObjectURL(downloadLink.href);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  return (
    <>
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="generative-fill fadein flex flex-col items-center sm:ml-[120px] md:ml-[330px] mr-0 sm:mr-4 p-4"
      >
        <div className="head mt-8 flex flex-col items-center">
          <Chip
            color="warning"
            variant="dot"
            className={`${litePoppins2.className} py-4 text-md px-2 bg-[#120f0f9a] shadow-xl`}
          >
            AI MAGIC EXPAND
          </Chip>
          <p
            className={`${litePoppins.className} mt-3 text-center text-[3.5rem]`}
          >
            <span className="bg-gradient-to-r from-blue-600 to-gray-300 text-transparent bg-clip-text font-bold">
              Intellect.AI's
            </span>{" "}
            Magic Expand for Images
          </p>
          <p
            className={`${litePoppins2.className} mt-3 text-lg w-3/4 text-center text-gray-300`}
          >
            Revolutionize your images with our app! Easily fill sections of your
            photos with stunning generative designs, ensuring seamless
            transformations for captivating visual content.
          </p>
        </div>
        <div className="bottom mt-14 w-[90%] flex items-center justify-between">
          <div className="left shadow-xl bg-gradient-to-r  from-blue-200 to-white w-[450px] leading-10 flex flex-col items-center rounded-2xl text-black">
            <div
              className={`${litePoppins.className} top p-10 border-b-2 border-dashed border-[#a9a9b2] w-full flex flex-col items-center`}
            >
              {!file ? (
                <Button
                  onClick={handleClick}
                  color="primary"
                  className={`${litePoppins.className} text-lg p-7 w-full shadow-lg shadow-[#0000002f]`}
                >
                  Choose Image
                </Button>
              ) : (
                <>
                  <div className="w-full flex flex-col items-center">
                    <div className="selected-file text-center mb-4 flex items-center">
                      <PiFileImage
                        fontSize={22}
                        className="text-green-800 mr-3"
                      />
                      <p className={`${litePoppins.className} text-green-800`}>
                        File selected:{" "}
                        {file.name.length > 12
                          ? `${file.name.slice(0, 12)}...${file.type.replace(
                              "image/",
                              ""
                            )}`
                          : `${file.name}.${file.type.replace("image/", "")}`}
                      </p>
                    </div>
                    <Button
                      onPress={() => {
                        onOpen();
                        uploadImage(file);
                      }}
                      color="primary"
                      className={`${litePoppins.className} text-lg p-7 w-full shadow-lg shadow-[#0000002f]`}
                    >
                      Upload Image
                    </Button>
                  </div>
                </>
              )}
              <p className="relative top-3">or drag and drop an image</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            <div className="bottom flex flex-col items-center p-5">
              <p className={`${litePoppins.className}`}>
                No image? try one of these:
              </p>
              <div className="all-imgs py-4 flex items-center gap-4">
                <Image
                  src="https://res.cloudinary.com/dntkbcfor/image/upload/v1714142060/images/MagicExpand/demo1.jpg"
                  alt="img1"
                  width={80}
                  height={80}
                  onClick={() => {
                    onOpen();
                    setUploadedIMG(
                      "https://res.cloudinary.com/dntkbcfor/image/upload/v1714142060/images/MagicExpand/demo1.jpg"
                    );
                  }}
                  className="aspect-square object-cover cursor-pointer shadow-lg shadow-[#0000003e]"
                />
                <Image
                  src="https://res.cloudinary.com/dntkbcfor/image/upload/v1714142059/images/MagicExpand/demo2.jpg"
                  alt="img2"
                  width={80}
                  height={80}
                  onClick={() => {
                    onOpen();
                    setUploadedIMG(
                      "https://res.cloudinary.com/dntkbcfor/image/upload/v1714142059/images/MagicExpand/demo2.jpg"
                    );
                  }}
                  className="aspect-square object-cover cursor-pointer shadow-lg shadow-[#0000003e]"
                />
                <Image
                  src="https://res.cloudinary.com/dntkbcfor/image/upload/v1714142059/images/MagicExpand/demo3.webp"
                  alt="img3"
                  width={80}
                  height={80}
                  onClick={() => {
                    onOpen();
                    setUploadedIMG(
                      "https://res.cloudinary.com/dntkbcfor/image/upload/v1714142059/images/MagicExpand/demo3.webp"
                    );
                  }}
                  className="aspect-square object-cover cursor-pointer shadow-lg shadow-[#0000003e]"
                />
              </div>
            </div>
          </div>
          <div className="right">
            <Image
              src="/generative/demo.png"
              alt="demo"
              width={550}
              height={550}
              className="aspect-square object-cover shadow-xl shadow-[#0000003e]"
            />
          </div>
        </div>
      </div>

      {/* Modal  */}

      <Modal
        backdrop="blur"
        isDismissable={false}
        isOpen={isOpen}
        size={uploadedIMG ? "2xl" : "xl"}
        onOpenChange={onOpenChange}
        onClose={() => {
          onClose();
          setFile(null);
          setTimeout(() => {
            setUploadedIMG(null);
            setGeneratedIMG(null);
          }, 500);
          setRatio(null);
          setIsGenerateClicked(false);
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody>
                {!uploadedIMG && (
                  <>
                    <div className="upload-img fadein flex flex-col items-center w-full p-5">
                      <p className={`${litePoppins.className} text-xl`}>
                        Uploading your image
                      </p>
                      <p
                        className={`${litePoppins2.className} mt-2 text-gray-400`}
                      >
                        Please wait... this process may take a while.
                      </p>
                      <Progress
                        size="sm"
                        isIndeterminate
                        aria-label="Loading..."
                        className="max-w-md py-5"
                      />
                    </div>
                  </>
                )}
                {uploadedIMG && (
                  <>
                    <div
                      className={`gen-fill fadein py-5 flex gap-8 ${
                        !isGenerateClicked ? "items-start" : "items-center"
                      } justify-between`}
                    >
                      <div
                        className={`${litePoppins.className} left flex flex-col items-center`}
                      >
                        <p>Original Image</p>
                        <Image
                          src={uploadedIMG}
                          alt="original"
                          className="mt-5"
                          width={300}
                        />
                      </div>
                      <div className="right w-1/2">
                        {!isGenerateClicked && !generatedIMG && (
                          <div className="top w-full">
                            <p className={litePoppins.className}>
                              Choose any preferred ratio
                            </p>
                            <Select
                              className={`${litePoppins2.className} py-5 w-full`}
                              label="Select ratio"
                              selectedKeys={ratio}
                              onSelectionChange={setRatio}
                            >
                              <SelectItem
                                className={litePoppins2.className}
                                key="1:1"
                                value={"1:1"}
                              >
                                Square (1:1)
                              </SelectItem>
                              <SelectItem
                                className={litePoppins2.className}
                                key="16:9"
                                value={"16:9"}
                              >
                                Horizontal (16:9)
                              </SelectItem>
                              <SelectItem
                                className={litePoppins2.className}
                                key="9:16"
                                value={"9:16"}
                              >
                                Vertical (9:16)
                              </SelectItem>
                            </Select>
                            <Button
                              color="primary"
                              isDisabled={ratio?.size === 0}
                              className={`${litePoppins.className} w-full`}
                              onClick={expandImage}
                            >
                              Start Generating
                            </Button>
                          </div>
                        )}
                        {isGenerateClicked && !generatedIMG && (
                          <div className="loading fadein">
                            <Spinner
                              label="Please wait! Your image is being generated"
                              color="default"
                              labelColor="foreground"
                              className={`${litePoppins2.className} text-center`}
                            />
                          </div>
                        )}
                        {generatedIMG && (
                          <>
                            <div
                              className={`${litePoppins.className} flex faadein flex-col items-center`}
                            >
                              <p>Generated Image</p>
                              <Image
                                src={generatedIMG}
                                alt="original"
                                className="mt-5"
                                width={300}
                                height={280}
                              />
                              <Button
                                onClick={downloadImage}
                                color="primary"
                                className={`${litePoppins.className} mt-6`}
                              >
                                <HiOutlineDownload
                                  fontSize={22}
                                  className="text-white"
                                />
                                Download Image
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

export default page;
