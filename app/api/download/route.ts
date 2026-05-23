import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { files, projectName } = body;

    if (!files || typeof files !== "object") {
      return NextResponse.json(
        { error: "Files are required" },
        { status: 400 }
      );
    }

    const zip = new JSZip();

    // Add each file to the zip
    for (const [path, content] of Object.entries(files)) {
      // Remove leading slash if present
      const cleanPath = path.startsWith("/") ? path.slice(1) : path;
      zip.file(cleanPath, content as string);
    }

    // Add a basic package.json if not present
    if (!files["package.json"] && !files["/package.json"]) {
      const packageJson = {
        name: projectName || "my-app",
        version: "1.0.0",
        private: true,
        scripts: {
          dev: "next dev",
          build: "next build",
          start: "next start",
          lint: "next lint",
        },
        dependencies: {
          next: "^15.0.0",
          react: "^19.0.0",
          "react-dom": "^19.0.0",
        },
        devDependencies: {
          typescript: "^5.0.0",
          "@types/react": "^19.0.0",
          "@types/react-dom": "^19.0.0",
          "@types/node": "^22.0.0",
          tailwindcss: "^4.0.0",
        },
      };
      zip.file("package.json", JSON.stringify(packageJson, null, 2));
    }

    // Add a README if not present
    if (!files["README.md"] && !files["/README.md"]) {
      const readme = `# ${projectName || "My App"}

This project was generated with BuilderX.

## Getting Started

First, install the dependencies:

\`\`\`bash
npm install
# or
yarn install
# or
pnpm install
\`\`\`

Then, run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

Open [https://builder-x-nine.vercel.app](https://builder-x-nine.vercel.app) with your browser to see the result.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
`;
      zip.file("README.md", readme);
    }

    // Generate the zip file
    const zipBuffer = await zip.generateAsync({
      type: "arraybuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 9 },
    });

    const filename = `${projectName || "project"}.zip`;

    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate zip file" },
      { status: 500 }
    );
  }
}
