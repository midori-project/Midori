export default function WorkSpacePage({ params }: { params: { id: string } }) {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Workspace Details</h1>
            <p className="text-gray-600">
                This page will display the details
            </p>
        </div>
    );
}
