#!/usr/bin/env node

import { Project, SyntaxKind } from "ts-morph";
import path from "path";
import fs from "fs";

const projectRoot = path.resolve(process.cwd());
const srcDir = path.join(projectRoot, "src");

const project = new Project({
    tsConfigFilePath: path.join(projectRoot, "tsconfig.json"),
    skipFileDependencyResolution: true,
});

function shouldProcess(filePath) {
    return filePath.endsWith(".tsx") && filePath.startsWith(srcDir);
}

function ensureButtonImport(sourceFile) {
    const importDeclarations = sourceFile.getImportDeclarations();
    const existing = importDeclarations.find((d) => {
        const module = d.getModuleSpecifierValue();
        return module === "@components/ui/button" || module.endsWith("/components/ui/button");
    });

    if (existing) {
        const namedImports = existing.getNamedImports();
        const hasButton = namedImports.some((ni) => ni.getName() === "Button");

        if (!hasButton) {
            existing.addNamedImport("Button");
        }
        return;
    }

    // Insert at top after other imports (or at top if none).
    sourceFile.insertImportDeclaration(0, {
        namedImports: ["Button"],
        moduleSpecifier: "@components/ui/button",
    });
}

function updateButtonElements(sourceFile) {
    const jsxElements = sourceFile.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement)
        .concat(sourceFile.getDescendantsOfKind(SyntaxKind.JsxOpeningElement));

    let changed = false;

    jsxElements.forEach((node) => {
        const tagNameNode = node.getTagNameNode();
        const tagName = tagNameNode.getText();

        const isButtonElement = tagName === "button";
        const isShadcnButton = tagName === "Button";

        if (isButtonElement) {
            tagNameNode.replaceWithText("Button");
            changed = true;
        }

        // If the button already has custom styling via className, keep it as-is
        // by avoiding the default shadcn variant styles.
        if (isButtonElement || isShadcnButton) {
            const classAttr = node.getAttribute("className");
            const variantAttr = node.getAttribute("variant");
            const sizeAttr = node.getAttribute("size");

            if (classAttr) {
                if (!variantAttr) {
                    node.addAttribute({ name: "variant", initializer: '"unstyled"' });
                    changed = true;
                }

                // Add size based on common padding patterns (e.g. py-1, py-2) so the
                // shadcn Button size system matches the expected padding/typography.
                if (!sizeAttr) {
                    const classText = classAttr.getText();
                    const hasPy1 = /py-1(\s|$)/.test(classText);
                    const hasPy2 = /py-2(\s|$)/.test(classText);
                    const hasPy3 = /py-3(\s|$)/.test(classText);
                    const hasPy4 = /py-4(\s|$)/.test(classText);

                    if (hasPy1) {
                        node.addAttribute({ name: "size", initializer: '"sm"' });
                        changed = true;
                    } else if (hasPy3 || hasPy4) {
                        node.addAttribute({ name: "size", initializer: '"lg"' });
                        changed = true;
                    } else if (hasPy2) {
                        node.addAttribute({ name: "size", initializer: '"default"' });
                        changed = true;
                    }
                }
            }
        }
    });

    // Also update closing tags
    const closingTags = sourceFile.getDescendantsOfKind(SyntaxKind.JsxClosingElement);
    closingTags.forEach((tag) => {
        const tagNameNode = tag.getTagNameNode();
        if (tagNameNode.getText() === "button") {
            tagNameNode.replaceWithText("Button");
            changed = true;
        }
    });

    return changed;
}

function processFile(filePath) {
    const sourceFile = project.addSourceFileAtPath(filePath);
    const originalText = sourceFile.getFullText();

    const changed = updateButtonElements(sourceFile);
    if (!changed) return false;

    ensureButtonImport(sourceFile);

    const newText = sourceFile.getFullText();
    if (newText !== originalText) {
        sourceFile.saveSync();
        return true;
    }

    return false;
}

function main() {
    const filePaths = [];
    function walk(dir) {
        for (const name of fs.readdirSync(dir)) {
            const full = path.join(dir, name);
            const stat = fs.statSync(full);
            if (stat.isDirectory()) {
                walk(full);
            } else if (stat.isFile() && full.endsWith(".tsx")) {
                filePaths.push(full);
            }
        }
    }

    walk(srcDir);

    const updatedFiles = [];
    for (const filePath of filePaths) {
        if (processFile(filePath)) {
            updatedFiles.push(filePath);
        }
    }

    if (updatedFiles.length) {
        console.log(`Updated ${updatedFiles.length} files:`);
        updatedFiles.forEach((f) => console.log(` - ${path.relative(projectRoot, f)}`));
    } else {
        console.log("No files were updated.");
    }
}

main();
