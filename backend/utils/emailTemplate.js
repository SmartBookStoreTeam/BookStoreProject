import fs from "fs";
import path from "path";

const loadEmailTemplate = (templateName, replacements = {}) => {
  const filePath = path.join(process.cwd(), "emails", `${templateName}.html`);

  let html = fs.readFileSync(filePath, "utf-8");

  Object.keys(replacements).forEach((key) => {
    html = html.replace(new RegExp(`{{${key}}}`, "g"), replacements[key]);
  });

  return html;
};

export default loadEmailTemplate;
