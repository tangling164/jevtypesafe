import { loadContent } from "../src/lib/content";

const content = loadContent();
console.log(`Validated ${content.projects.length} published projects and ${content.categories.length} categories.`);
