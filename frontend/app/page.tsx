"use client";
import { CardTitle, CardHeader, CardDescription, CardContent, CardFooter, Card, } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { TextDocumentIcon, DoubleBubbleIcon } from "@/components/ui/icons";
import Navbar from "@/components/ui/navbar";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div>
        <Navbar activePage="Home" />
      </div>
      <div className="flex justify-center py-10">
        <div className="max-w-4xl space-y-8 p-8">
          <h1 className="text-center text-3xl font-bold dark:text-gray-300">
            Create a map
          </h1>
          <p className="text-center text-lg dark:text-gray-300">
            Use your own text and data or a ChatGPT prompt
          </p>
          <div className="grid grid-cols-2 gap-8">
            <button
              className="flex flex-col items-center space-y-4"
              onClick={() => router.push("/datasource")}
            >
              <Card className="w-full max-w-[400px]">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <TextDocumentIcon />
                    <CardTitle>Use a text or data source</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-left">
                    The text or data must contain locations, addresses or points
                    of interest.
                  </CardDescription>
                </CardContent>
                <CardFooter className="flex justify-end" />
              </Card>
            </button>
            <button
              className="flex flex-col items-center space-y-4"
              onClick={() => router.push("/askChat")}
            >
              <Card className="w-full max-w-[400px]">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <DoubleBubbleIcon />
                    <CardTitle>Ask ChatGPT a question</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-left">
                    Curious about Earth's wonders? Unlock the world's insights
                    with ChatGPT!
                  </CardDescription>
                </CardContent>
                <CardFooter className="flex justify-end" />
              </Card>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="mt-4">
                <h2 className="text-xl font-bold dark:text-gray-300">
                  Examples of text or data sources:
                </h2>
                <ul className="list-disc list-inside space-y-2 dark:text-gray-300">
                  <li>Travel Itineraries</li>
                  <li>Class Material: Geography, History, etc...</li>
                  <li>News Reports and Articles</li>
                  <li>Books with Places</li>
                  <li>Spreadsheet with Results for a Political Election</li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="mt-4">
                <h2 className="text-xl font-bold dark:text-gray-300">
                  Examples of what you can ask:
                </h2>
                <ul className="list-disc list-inside space-y-2 dark:text-gray-300">
                  <li>What should I see when visiting Paris?</li>
                  <li>What are the highest mountains in the world?</li>
                  <li>Which countries took part in WW2?</li>
                  <li>Where is banana grown?</li>
                  <li>Where are the best surfing spots in California?</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-8">
            <a
              className="text-blue-500 hover:underline"
              href="#"
              onClick={() => router.push("#")}
            >
              Try an example text →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
