'use client';
import { CardTitle, CardHeader, CardDescription, CardContent, CardFooter, Card } from "@/components/ui/card"
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex justify-center py-10">
      <div className="max-w-4xl space-y-8 p-8">
        <h1 className="text-center text-3xl font-bold">Create a map</h1>
        <p className="text-center text-lg">Use your own text and data or a ChatGPT prompt</p>
        <div className="grid grid-cols-2 gap-8">
          <div className="flex flex-col items-center space-y-4" onClick={() => router.push("/datasource")}>
              <Card className="w-full max-w-[400px] bg-white border border-blue-500 rounded-lg shadow-sm hover:shadow-md transition-shadow dark:border-gray-800" onClick={() => router.push("#")}>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <TextIcon className="h-5 w-5 text-blue-600" />
                    <CardTitle>Use a text or data source</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    The text or data must contain locations, addresses or points of interest.
                  </CardDescription>
                </CardContent>
                <CardFooter className="flex justify-end" />
              </Card>
          </div>
          <div className="flex flex-col items-center space-y-4" onClick={() => router.push("/askChat")}>
            <Card className="w-full max-w-[400px] bg-white border border-blue-500 rounded-lg shadow-sm hover:shadow-md transition-shadow dark:border-gray-800" onClick={() => router.push("#")}>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <BarChart2Icon className="h-5 w-5 text-blue-600" />
                  <CardTitle>Ask ChatGPT a question</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Curious about Earth's wonders? Unlock the world's insights with ChatGPT!
                </CardDescription>
              </CardContent>
              <CardFooter className="flex justify-end" />
            </Card>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="mt-4">
              <h2 className="text-xl font-bold">Examples of text or data sources:</h2>
              <ul className="list-disc list-inside space-y-2">
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
              <h2 className="text-xl font-bold">Examples of what you can ask:</h2>
              <ul className="list-disc list-inside space-y-2">
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
          <a className="text-blue-500 hover:underline" href="#" onClick={() => router.push("#")}>
            Try an example text →
          </a>
        </div>
      </div>
    </div>
  )
}


function TextIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 6.1H3" />
      <path d="M21 12.1H3" />
      <path d="M15.1 18H3" />
    </svg>
  )
}


function BarChart2Icon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" x2="18" y1="20" y2="10" />
      <line x1="12" x2="12" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="14" />
    </svg>
  )
}
