export default function AddressAutocomplete({ city }: { city: string }) {
    return (
        <form action="/book-analysis" className="mt-6 flex flex-col sm:flex-row gap-3">
            <input
                type="text"
                name="address"
                autoComplete="street-address"
                placeholder={`Enter your ${city} street address...`}
                className="flex-1 px-4 py-4 rounded-xl text-slate-900 border-2 border-transparent focus:border-blue-300 outline-none shadow-sm"
                required
            />
            <button type="submit" className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-xl font-extrabold text-lg transition shadow-lg whitespace-nowrap">
                Analyze My Risk
            </button>
        </form>
    );
}
