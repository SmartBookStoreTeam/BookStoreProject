import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const SkeletonLoading = () => {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div dir={i18n.dir()} className="min-h-screen bg-gray-50 dark:bg-zinc-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-6 xl:px-8">
        {/* Back Button */}
        <button
          dir="ltr"
          onClick={() => navigate("/shop")}
          className="flex md:hidden items-center active:-translate-x-1 justify-start mr-auto text-gray-500 dark:text-gray-300 hover:text-gray-900 hover:dark:text-gray-200 mb-7 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          {t("Back to Shop")}
        </button>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden dark:bg-[#1a1a22]">
          <div className="p-8 lg:p-10">
            <div className="flex flex-col lg:grid lg:grid-cols-[auto_1fr_340px] gap-6 lg:gap-10">
              {/* Book Image Skeleton */}
              <div className="flex flex-col items-center lg:items-start">
                <Skeleton
                  width={288}
                  height={384}
                  borderRadius={12}
                  baseColor="#b1aebbff"
                  highlightColor="#f3f4f6"
                />
                {/* Thumbnail Skeletons */}
                <div className="hidden grid grid-cols-4 gap-2 mt-4 w-72">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton
                      key={i}
                      width={64}
                      height={64}
                      borderRadius={8}
                      baseColor="#a09daaff"
                      highlightColor="#f3f4f6"
                    />
                  ))}
                </div>
              </div>

              {/* Book Info Skeleton */}
              <div className="flex flex-col">
                {/* Title */}
                <Skeleton
                  width="80%"
                  height={40}
                  className="mb-4"
                  baseColor="#a09daaff"
                  highlightColor="#f3f4f6"
                />

                {/* Author */}
                <Skeleton
                  width={200}
                  height={24}
                  className="mb-4"
                  baseColor="#a09daaff"
                  highlightColor="#f3f4f6"
                />

                {/* Rating */}
                <div className="flex gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton
                      key={i}
                      width={20}
                      height={20}
                      circle
                      baseColor="#a09daaff"
                      highlightColor="#f3f4f6"
                    />
                  ))}
                  <Skeleton
                    width={60}
                    height={20}
                    className="ml-2"
                    baseColor="#a09daaff"
                    highlightColor="#f3f4f6"
                  />
                </div>
                {/*  Price Card Skeleton - Mobile */}
                <div className="block md:hidden mt-6">
                  <Skeleton
                    width={200}
                    height={50}
                    borderRadius={10}
                    className="mb-4"
                    baseColor="#a09daaff"
                    highlightColor="#f3f4f6"
                  />
                </div>

                {/* Category */}
                <Skeleton
                  width={120}
                  height={32}
                  borderRadius={16}
                  className="mb-6"
                  baseColor="#a09daaff"
                  highlightColor="#f3f4f6"
                />

                {/* Description */}
                <Skeleton
                  width={100}
                  height={24}
                  className="mb-2"
                  baseColor="#a09daaff"
                  highlightColor="#f3f4f6"
                />
                <Skeleton
                  count={4}
                  height={16}
                  className="mb-2"
                  baseColor="#a09daaff"
                  highlightColor="#f3f4f6"
                />

                {/* Price Card Skeleton - Mobile */}
                <div dir="ltr" className="block md:hidden mt-6">
                  <div className="rounded-xl p-6">
                    <Skeleton
                      width={120}
                      height={25}
                      className="mb-4"
                      baseColor="#a09daaff"
                      highlightColor="#f3f4f6"
                    />
                    <Skeleton
                      width="100%"
                      height={48}
                      borderRadius={8}
                      className="mb-3"
                      baseColor="#a09daaff"
                      highlightColor="#f3f4f6"
                    />
                    <Skeleton
                      width="100%"
                      height={48}
                      borderRadius={8}
                      className="mb-3"
                      baseColor="#a09daaff"
                      highlightColor="#f3f4f6"
                    />
                    <Skeleton
                      width="100%"
                      height={48}
                      borderRadius={8}
                      baseColor="#a09daaff"
                      highlightColor="#f3f4f6"
                    />
                  </div>
                </div>
              </div>

              {/* Price Card Skeleton - Desktop */}
              <div dir="ltr" className="hidden md:block">
                <div className="rounded-xl p-6">
                  <Skeleton
                    width="100%"
                    className="mb-4"
                    height={66}
                    borderRadius={10}
                    baseColor="#a09daaff"
                    highlightColor="#f3f4f6"
                  />
                  <Skeleton
                    width={120}
                    height={25}
                    className="mb-4"
                    baseColor="#a09daaff"
                    highlightColor="#f3f4f6"
                  />
                  <Skeleton
                    width="100%"
                    height={48}
                    borderRadius={8}
                    className="mb-3"
                    baseColor="#a09daaff"
                    highlightColor="#f3f4f6"
                  />
                  <Skeleton
                    width="100%"
                    height={48}
                    borderRadius={8}
                    className="mb-3"
                    baseColor="#a09daaff"
                    highlightColor="#f3f4f6"
                  />
                  <Skeleton
                    width="100%"
                    height={48}
                    borderRadius={8}
                    baseColor="#a09daaff"
                    highlightColor="#f3f4f6"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details - Same position as BookDetails */}
          <div className="px-8 lg:px-10 pb-8 lg:pb-10">
            {/* Title */}
            <Skeleton
              width={150}
              height={24}
              className="mb-4"
              baseColor="#a09daaff"
              highlightColor="#f3f4f6"
            />
            {/* Details Grid - Same layout as BookDetails */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-gray-50 rounded-lg dark:bg-gray-800">
              {["ISBN", "Edition", "Year", "Pages"].map((label, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <Skeleton
                    width={50}
                    height={14}
                    baseColor="#a09daaff"
                    highlightColor="#f3f4f6"
                  />
                  <Skeleton
                    width={100}
                    height={18}
                    baseColor="#a09daaff"
                    highlightColor="#f3f4f6"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoading;
