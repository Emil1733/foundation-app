export default function AddressAutocomplete({ city }: { city: string }) {
    return (
        <form action="/book-analysis" className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 text-left">
                <label htmlFor="property-street-address" className="mb-2 block text-sm font-semibold text-white">
                    Property street address
                </label>
                <input
                    id="property-street-address"
                    type="text"
                    name="address"
                    autoComplete="street-address"
                    inputMode="text"
                    placeholder={`Enter your ${city} street address...`}
                    className="w-full px-4 py-4 rounded-xl text-slate-900 border-2 border-transparent focus:border-blue-300 outline-none shadow-sm"
                    required
                />
            </div>
            <button type="submit" className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-xl font-extrabold text-lg transition shadow-lg whitespace-nowrap">
                Analyze My Risk
            </button>
        </form>
    );
}
