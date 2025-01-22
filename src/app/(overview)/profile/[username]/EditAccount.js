"use client";

import {
  Avatar,
  Button,
  Input,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  Switch,
  Textarea,
} from "@nextui-org/react";
import { Poppins } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import { FiEdit3 } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

const poppins = Poppins({
  weight: "400",
  subsets: ["latin"],
});
function EditAccount({ userData, close }) {
  const nameParts = userData?.name?.trim().split(" ");

  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

  const [changes, setChanges] = useState(false);
  const [firstname, setFirstname] = useState(firstName);
  const [lastname, setLastname] = useState(lastName);
  const [professionValue, setProfessionValue] = useState(new Set([]));
  const [summary, setSummary] = useState(userData?.summary);
  const [userName, setUserName] = useState(userData?.username);
  const [isSubmit, setIsSubmit] = useState(false);
  const [isUsernameInvalid, setIsUsernameInvalid] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [profileImg, setProfileImg] = useState(userData?.profileImg);
  const [isPublic, setIsPublic] = useState(userData?.visibility);

  useEffect(() => {
    if (
      userName !== userData?.username ||
      summary !== userData?.summary ||
      firstname !== firstName ||
      lastname !== lastName ||
      !isPublic ||
      professionValue?.currentKey !== undefined
    ) {
      setChanges(true);
    }
  }, [
    userName,
    userData,
    summary,
    firstname,
    firstName,
    lastname,
    lastName,
    isPublic,
    professionValue?.currentKey,
  ]);

  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.size <= 10000000) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImg(e.target.result);
        setChanges(true);
      };
      reader.readAsDataURL(file);
    } else {
      errorMsg(`File size should be less than 10MB`);
    }
  };

  const professions = [
    "Designer",
    "Developer",
    "Freelancer",
    "Content Creator",
    "Musician",
    "Photographer",
    "Writer",
    "Others",
  ];

  const updateProfile = async () => {
    try {
      setIsSubmit(true);
      let newImage;
      if (profileImg !== userData?.profileImg) {
        newImage = await uploadImage(profileImg);
      }
      const response = await fetch("/api/profile-update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${firstname} ${lastname}`,
          username: userName,
          summary,
          profile: newImage ? newImage : userData?.profileImg,
          visibility: isPublic,
          profession: professionValue?.currentKey,
        }),
      });

      const { success, data, error } = await response.json();
      if (data) {
        successMsg("Profile updated successfully!");
        setIsSubmit(false);
        setTimeout(() => {
          window.open(`/profile/${data?.username}`, "_self");
        }, 500);
      }
      if (error && error === "Username already exists") {
        setIsSubmit(false);

        setIsUsernameInvalid(true);
        setErrorMessage(error);
      }
    } catch (error) {
      setIsSubmit(false);
      errorMsg(error.message);
    }
  };

  const uploadImage = async (file) => {
    if (!file) return null;
  
    const formData = new FormData();
    formData.append("file", file); // Attach the file
    formData.append("upload_preset", "intellect"); // Your upload preset from Cloudinary
    formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY); // Your Cloudinary API key
    formData.append("public_id", `images/profile/${Date.now()}`); // Optional: Public ID to organize images
  
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData, // Send formData, not JSON
        }
      );
  
      const data = await response.json();
      if (data?.secure_url) {
        return data?.secure_url; // Return the image URL from Cloudinary
      } else {
        throw new Error('Image upload failed');
      }
    } catch (error) {
      console.error("Error uploading image:", error.message);
      // Handle error appropriately (e.g., show an alert to the user)
    }
  };
  

  //Toasts

  const successMsg = (msg) =>
    toast.success(msg, {
      className: `${poppins.className} text-sm`,
    });

  const errorMsg = (msg) =>
    toast.error(msg, {
      className: `${poppins.className} text-sm`,
    });

  return (
    <>
      <Toaster />

      <ModalBody>
        <div className="user-form mb-3">
          <div className="profile flex items-center gap-8">
            <div className="dp flex items-end">
              <Avatar
                src={profileImg ? profileImg : userData?.profileImg}
                className="w-20 h-20 text-large"
              />
              <Button
                isIconOnly
                color="primary"
                className="rounded-full absolute left-[5.35rem]"
                size="sm"
                onClick={handleButtonClick}
              >
                <FiEdit3 color="white" fontSize={15} />
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            <div>
              <p className={`${poppins.className} text-lg font-semibold`}>
                {userData?.name}
              </p>
              <p className={`${poppins.className} text-gray-400`}>
                @{userData?.username}
              </p>
            </div>
          </div>
          <p className={`${poppins.className} text-gray-400 my-4`}>
            The photo will be used for your profile, and will be visible to
            other users of the platform.
          </p>
          <div className="form-body mt-5">
            <div className="row-1 flex items-center justify-between">
              <Input
                key="outside"
                type="text"
                label="Username"
                className={`${poppins.className} w-[250px]`}
                labelPlacement="outside"
                placeholder="Enter username"
                onChange={(e) => setUserName(e.target.value)}
                defaultValue={userName}
                isInvalid={isUsernameInvalid}
                errorMessage={errorMessage}
                variant={isUsernameInvalid ? "bordered" : "flat"}
              />
              <Input
                key="outside"
                type="email"
                label="Email"
                className={`${poppins.className} w-[250px]`}
                labelPlacement="outside"
                placeholder="Enter email"
                isReadOnly
                defaultValue={userData?.email}
              />
            </div>
            <div className="row-2 mt-6 flex items-center justify-between">
              <Input
                key="outside"
                type="text"
                label="First Name"
                className={`${poppins.className} w-[250px]`}
                labelPlacement="outside"
                placeholder="Enter first name"
                defaultValue={firstname}
                onChange={(e) => setFirstname(e.target.value)}
              />
              <Input
                key="outside"
                type="text"
                label="Last Name"
                className={`${poppins.className} w-[250px]`}
                labelPlacement="outside"
                placeholder="Enter last name"
                defaultValue={lastname}
                onChange={(e) => setLastname(e.target.value)}
              />
            </div>
            <div className="row-3 mt-6 flex items-center">
              <Select
                labelPlacement="outside"
                label="Profession"
                placeholder="Select profession"
                selectedKeys={professionValue}
                className={`${poppins.className} w-[250px]`}
                onSelectionChange={setProfessionValue}
              >
                {professions?.map((profession) => (
                  <SelectItem
                    className={poppins.className}
                    key={profession}
                    value={profession}
                  >
                    {profession}
                  </SelectItem>
                ))}
              </Select>
              <div className={`${poppins.className} flex flex-col gap-2 ml-8`}>
                <p className="text-sm">Visibility</p>
                <Switch isSelected={isPublic} onValueChange={setIsPublic}>
                  <p className="text-sm"> {isPublic ? "Public" : "Private"}</p>
                </Switch>
              </div>
            </div>
            <div className={`${poppins.className} summary mt-6`}>
              <Textarea
                label="Summary"
                labelPlacement="outside"
                placeholder="Enter summary"
                className="w-full"
                defaultValue={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter className={`${poppins.className} mb-2`}>
        <Button color="default" variant="ghost" radius="full" onPress={close}>
          Cancel
        </Button>
        <Button
          isDisabled={!changes}
          color="primary"
          radius="full"
          onPress={updateProfile}
          isLoading={isSubmit}
        >
          Save changes
        </Button>
      </ModalFooter>
    </>
  );
}

export default EditAccount;
