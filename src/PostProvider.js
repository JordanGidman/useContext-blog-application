import { createContext, useContext, useMemo, useState } from "react";
import { faker } from "@faker-js/faker";

function createRandomPost() {
  return {
    title: `${faker.hacker.adjective()} ${faker.hacker.noun()}`,
    body: faker.hacker.phrase(),
  };
}

// 1) CREATING A NEW CONTEXT
const PostContext = createContext();

function PostProvider({ children }) {
  const [posts, setPosts] = useState(() =>
    Array.from({ length: 30 }, () => createRandomPost())
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Derived state. These are the posts that will actually be displayed
  const searchedPosts =
    searchQuery.length > 0
      ? posts.filter((post) =>
          `${post.title} ${post.body}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        )
      : posts;

  function handleAddPost(post) {
    setPosts((posts) => [post, ...posts]);
  }

  function handleClearPosts() {
    setPosts([]);
  }

  //here we are memoizing the object we pass to the provider as the value as if we dont there are wasted renders due to the object being re-created each time the context re-renders making it a different object
  //even though the values within are the same. In this case there will still be a re-render but it will correctly be because the parent re-rendered and not that the context changed
  const value = useMemo(() => {
    return {
      posts: searchedPosts,
      onAddPost: handleAddPost,
      onClearPosts: handleClearPosts,
      searchQuery,
      setSearchQuery,
    };
  }, [searchQuery, searchedPosts]);

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
}

function usePosts() {
  const context = useContext(PostContext);
  //we cannot use this usePosts hook on app for example as it is only available to the children of the context provider so we need to throw an error if this is attempted
  if (context === undefined)
    throw new Error("PostContext was used outside the PostProvider");

  return context;
}

export { PostProvider, usePosts };
