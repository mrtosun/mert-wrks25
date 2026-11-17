/**
 * Notion data sources that feed mert.works.
 * These IDs are not secret. The access token lives in NOTION_TOKEN (.env locally, Netlify env vars in production).
 * Every data source must be shared with the Notion integration ("Connections" in the page menu).
 */
module.exports = {
  dataSources: {
    pages: "41b8b29f-f8a8-81f3-a067-000b26bf8bc3", // Site Pages: home bio + section intros
    links: "41b8b29f-f8a8-810a-ad37-000bfc4aef9d", // Links on the home page
    projects: "41b8b29f-f8a8-81c8-93db-000b0dc9d598", // Projects
    studio: "18c8b29f-f8a8-80a2-bb11-000bbcb6c19d", // Studio Projects (lives in Courses and Workshops)
    publications: "41b8b29f-f8a8-818d-826d-000b23bde832", // Publications
    teaching: "41b8b29f-f8a8-8177-b4b4-000b2117e261", // Teaching
  },
  // Collections whose rows can get their own page when "Detail page" is ticked
  detailCollections: ["projects", "studio", "teaching"],
  // Section pages, in navigation order. A section appears only when its Site Pages row is published.
  sections: ["projects", "studio", "teaching", "publications"],
}
