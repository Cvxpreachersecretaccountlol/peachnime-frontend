/* eslint-disable react-hooks/rules-of-hooks */
import { useParams } from "react-router-dom";
import { useInfiniteApi } from "../services/useApi";
import Loader from "../components/Loader";
import PageNotFound from "./PageNotFound";
import InfiniteScroll from "react-infinite-scroll-component";
import Image from "../components/Image";
import Heading from "../components/Heading";
import AZ from "../layouts/AZ";
import React from "react";
import Footer from "../components/Footer";
import { Helmet } from "react-helmet";

const ListPage = () => {
  const validateQueries = [
    "top-airing",
    "most-popular",
    "most-favorite",
    "completed",
    "recently-added",
    "recently-updated",
    "top-upcoming",
    "subbed-anime",
    "dubbed-anime",
    "movie",
    "tv",
    "ova",
    "ona",
    "special",
    "az-list",
    "genre",
    "producer",
  ];
  
  // Changed from 'category' to 'type' to match the route
  const { type, page: query = null } = useParams();
  const isValidQuery = validateQueries.includes(type);

  if (!isValidQuery) {
    return <PageNotFound />;
  }

  const endpoint = `/animes/${type}${query ? `/${query}` : ""}?page=`;
  const { data, isError, error, isLoading, hasNextPage, fetchNextPage } =
    useInfiniteApi(endpoint);

  if (isError) {
    return <PageNotFound />;
  }
  
  const pages = data?.pages;

  return (
    <div className="list-page pt-14">
      <Helmet>
        <title>{type} animes - Peachnime 🍑</title>
        <meta property="og:title" content={`${type} - Peachnime`} />
      </Helmet>
      {type === "az-list" && <AZ selected={query} />}
      {pages && !isLoading ? (
        <InfiniteScroll
          dataLength={data?.pages.flat().length || 0}
          next={fetchNextPage}
          hasMore={hasNextPage}
          loader={<Loader className="h-fit" />}
          endMessage={<Footer />}
        >
          <Heading>
            {query ? "" : type} {query} Anime
          </Heading>
          <div className="flex flex-wrap justify-around items-center">
            {pages?.map((page, pageIndex) => (
              <React.Fragment key={pageIndex}>
                {page.data.response.map((item, index) => (
                  <div key={item.id + index} className="flw-item">
                    <Image data={item} />
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </InfiniteScroll>
      ) : (
        <Loader className="h-[100dvh]" />
      )}
    </div>
  );
};

export default ListPage;
