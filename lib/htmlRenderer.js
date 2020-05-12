const path = require("path");
const fs = require("fs");
const util = require("util");


const Manager = require("./Manager");
const Engineer = require("./Engineer");
const Intern = require("./Intern");

const templatesDir = path.resolve(__dirname, "../templates");
const buildDir = path.resolve(__dirname, "../build/");

const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);

async function render(employees) {
  const html = [];

  const [
    managerTemplate,
    internTemplate,
    engineerTemplate,
    mainTemplate
  ] = await Promise.all([
    readFile(path.resolve(templatesDir, "manager.html"), "utf8"),
    readFile(path.resolve(templatesDir, "intern.html"), "utf8"),
    readFile(path.resolve(templatesDir, "engineer.html"), "utf8"),
    readFile(path.resolve(templatesDir, "main.html"), "utf8")
  ]);

  html.push(
    employees
    .filter(employee => employee instanceof Manager)
    .map(employee => {
      let template = managerTemplate;
      for (const key in employee) {
        template = replacePlaceholder(template, key, employee[key]);
      }
      return template;
    })
    .join("")
);


html.push(
  employees
    .filter(employee => employee instanceof Engineer)
    .map(employee => {
      let template = engineerTemplate;
      for (const key in employee) {
        template = replacePlaceholder(template, key, employee[key]);
      }
      return template;
    })
    .join("")
);


html.push(
  employees
    .filter(employee => employee instanceof Intern)
    .map(employee => {
      let template = internTemplate;
      for (const key in employee) {
        template = replacePlaceholder(template, key, employee[key]);
      }
      return template;
    })
    .join("")
);


if (!fs.existsSync(buildDir)) { 
  fs.mkdirSync(buildDir);
}
await writeFile(
  path.resolve(buildDir, "index.html"),
  replacePlaceholder(mainTemplate, "body", html.join(""))
);
}
function replacePlaceholder(template, target, value) {
const regex = new RegExp("{{ " + target + " }}", "gm");
const newTemplate = template.replace(regex, value);
return newTemplate;
}

module.exports = render;