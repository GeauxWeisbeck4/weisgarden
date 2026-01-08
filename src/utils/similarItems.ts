const similarItems = (currentItem: any, allItems: any, id: string) => {
  let categories: string[] = [];
  let tags: string[] = [];

  // set categories
  if (currentItem.data?.categories?.length > 0) {
    categories = currentItem.data.categories;
  }

  // set tags
  if (currentItem.data?.tags?.length > 0) {
    tags = currentItem.data.tags;
  }

  // filter by categories
  const filterByCategories = allItems.filter((item: any) => 
    categories.find((category) => item.data.categories.includes(category)),
  );

  const filterByTags = allItems.filter((item: any) => 
    tags.find((tag) => item.data.tags.includes(tag)),
  );

  // combine after filtering
  const combinedItems = [...filterByCategories, ...filterByTags];

  // remove self from list to ensure no duplicates
  const filterById = combinedItems.filter((item) => item.id !== id);

  // count instances of each item 
  const itemCount = filterById.reduce((accumulator: any, currentItem: any) => {
    accumulator[currentItem.id] = (accumulator[currentItem.id] || 0) + 1;
    return accumulator;
  }, {});

  // sort by number of instances
  const sortedItems = filterById.sort((a: any, b: any) => itemCount[b.id] - itemCount[a.id]);

  // remove items less than 2 instances
  const filteredItems = sortedItems.filter((items: any) => itemCount[items.id] > 1);

  // remove duplicates while preserving order
  const uniqueItems = [...new Set(filteredItems.map((item: any) => item.id))].map((id: string) => {
    return filteredItems.find((item: any) => item.id === id);
  });

  return uniqueItems;
};

export default similarItems;
