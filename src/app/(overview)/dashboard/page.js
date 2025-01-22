"use client";
import { Button, Card } from "@nextui-org/react";
import { Poppins } from "next/font/google";
import { useCallback, useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import toast, { Toaster } from "react-hot-toast";
import { RiShareForwardBoxLine } from "react-icons/ri";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Loading from "@/components/Loading";

const poppins = Poppins({
  weight: "500",
  subsets: ["latin"],
});

const litePoppins = Poppins({
  weight: "400",
  subsets: ["latin"],
});

function page() {
  const [library, setLibrary] = useState(null);
  const [imageIds, setImageIds] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const router = useRouter();

  //Toasts
  const successMsg = (msg) =>
    toast.success(msg, {
      className: `${poppins.className} text-sm`,
    });

  const errorMsg = (msg) =>
    toast.error(msg, {
      className: `${poppins.className} text-sm`,
    });

  const fetchLibraryData = useCallback(async () => {
    try {
      const response = await fetch("/api/library");
      const { success, data, error } = await response.json();
      if (success) {
        setLibrary(data?.images);
        setImageIds(data?.library?.images);
      } else {
        console.error("Error fetching user data:", error);
      }
    } catch (error) {
      console.error("Error fetching user data:", error.message);
    }
  }, []);

  useEffect(() => {
    fetchLibraryData();
  }, []);

  const DeletePost = async (id) => {
    try {
      setDeleteLoading(true);
      const response = await fetch(`api/images/delete?postId=${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const { success, message, error } = await response.json();
      if (success && message === "Image deleted") {
        successMsg(message + " successfully!");
        setDeleteLoading(false);
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
      if (error) {
        errorMsg(error);
        setDeleteLoading(false);
      }
    } catch (error) {
      errorMsg(error.message);
      setDeleteLoading(false);
    }
  };

  if (!library) {
    return (
      <>
        <div
          className={`${litePoppins.className} sm:ml-[120px] md:ml-[320px] mr-0 sm:mr-4`}
        >
          <div className="flex flex-col items-center justify-center h-screen">
            <Loading />
            <p className="text-lg relative bottom-14 text-gray-300">
              Hang tight while we load all the posts...
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Toaster />
      <div className="dashboard sm:mt-0 sm:ml-[120px] md:ml-[320px] mb-14">
        <div className="dashboard-data m-4 mt-10">
          <p className={`${poppins.className} text-2xl`}>Dashboard</p>
          <div className="mt-8 flex items-start flex-wrap gap-5">
            {library?.map((data, index) => {
              return (
                // <>
                //   <div key={index}>
                //     <Card className="col-span-12 cursor-pointer sm:col-span-4 h-[300px] w-[300px] relative group">
                //       <Image
                //         removeWrapper
                //         alt="Card background"
                //         className="z-0 w-full h-full object-cover"
                //         src={data}
                //       />
                //     </Card>
                //   </div>
                // </>
                <>
                  <div key={index}>
                    <Card className="col-span-12 cursor-pointer sm:col-span-4 h-[300px] w-[300px] relative group">
                      <div className="group-hover:opacity-100 opacity-0 m-2 transition-opacity duration-300 absolute inset-0 z-10 top-1 flex flex-col items-start">
                        <Button
                          isIconOnly
                          className="absolute right-0"
                          onClick={() =>
                            router.push(`/post/${imageIds[index]}`)
                          }
                          color="primary"
                        >
                          <RiShareForwardBoxLine fontSize={20} color="white" />
                        </Button>
                        <div className="bottom px-4 gap-4 w-full h-full flex flex-col items-center justify-center">
                          <p
                            className={`${litePoppins.className} text-sm text-center text-white`}
                          >
                            Do you want to delete this post forever?
                          </p>
                          <Button
                            isLoading={deleteLoading}
                            onClick={() => DeletePost(imageIds[index])}
                            className={`${litePoppins.className} w-1/2 bg-red-600`}
                          >
                            <MdDelete
                              fontSize={22}
                              className="text-white mr-3"
                            />
                            Delete
                          </Button>
                        </div>
                      </div>
                      <Image
                        removeWrapper
                        alt="Card background"
                        className="z-0 w-full h-full object-cover transition-all duration-300 group-hover:brightness-[.3]"
                        width={300}
                        height={300}
                        src={data?.url}
                      />
                    </Card>
                  </div>
                </>
              );
            })}

            {library && !library.length > 0 && (
              <>
                <div className="w-full flex flex-col items-center justify-center mt-14">
                  <Image
                    src="/empty-dashboard.png"
                    width={300}
                    height={300}
                    alt="empty"
                  />
                  <p
                    className={`${poppins.className} mt-4 text-xl w-2/3 text-center`}
                  >
                    Your dashboard is empty! Go and creation some masterpieces.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default page;
