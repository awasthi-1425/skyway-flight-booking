// app/~offline/page.tsx
export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-6xl mb-4">✈️</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">You are offline</h1>
      <p className="text-gray-500 text-center max-w-md">
        Please check your internet connection. 
        <br/><br/>
        Don't worry, your booked flights are safely cached on your device. Navigate to "/profile" to view them!
      </p>
    </main>
  );
}