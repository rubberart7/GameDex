'use client'; 

import React, { useEffect, useState, useRef, useCallback } from 'react';
import DealRow, { Deal } from './DealRow'; 
import LoadingSpinner from '../common/LoadingSpinner';

export interface StoreImage {
    banner: string;
    logo: string;
    icon: string;
}

export interface Store {
    storeID: string;
    storeName: string;
    isActive: number;
    images: StoreImage;
}

const CACHE_KEY_DEALS_PREFIX = 'cachedDeals_page_';
const CACHE_KEY_STORES = 'cachedStores';
const CACHE_EXPIRATION_MS = 60 * 60 * 1000; // 1 hour
const ITEMS_PER_PAGE = 60; // This must match the backend's pageSize for deals endpoint

const DealsList = () => {
    
    const [allDeals, setAllDeals] = useState<Deal[]>([]); 
    const [stores, setStores] = useState<Store[]>([]);

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState<string>('');

    // --- FILTER STATES ---
    const [selectedStoreID, setSelectedStoreID] = useState<string>('');
    
    const [maxSalePrice, setMaxSalePrice] = useState<number>(60);
    const [minSalePrice, setMinSalePrice] = useState<number>(0);
    
    const [sortOrder, setSortOrder] = useState<string>('salePriceAsc'); 

    // Pagination states
    const [currentPage, setCurrentPage] = useState<number>(0); // 0-indexed page number for API
    const [hasPreviousPage, setHasPreviousPage] = useState<boolean>(false);
    const [hasNextPage, setHasNextPage] = useState<boolean>(true); 
    const [isLastPage, setIsLastPage] = useState<boolean>(false); 

    
    const [isEditingPage, setIsEditingPage] = useState<boolean>(false);
    const [pageInput, setPageInput] = useState<string>(String(currentPage + 1)); 
    const pageInputRef = useRef<HTMLInputElement>(null);

    
    const isFetchingRef = useRef(false);

    
    const fetchDealsAndStores = useCallback(async (pageToFetch: number) => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;
        setLoading(true);
        setError(null);

        const dealsCacheKey = `${CACHE_KEY_DEALS_PREFIX}${pageToFetch}`;
        const storesCacheKey = CACHE_KEY_STORES;

        let dealsData: Deal[] = [];
        let storesData: Store[] = [];
        let dealsFromCache = false;
        let storesFromCache = false;

        // Try loading deals from cache
        const cachedDeals = localStorage.getItem(dealsCacheKey);
        if (cachedDeals) {
            try {
                const { data, timestamp } = JSON.parse(cachedDeals);
                if (Date.now() - timestamp < CACHE_EXPIRATION_MS) {
                    dealsData = data;
                    dealsFromCache = true;
                    console.log(`Deals for page ${pageToFetch} loaded from cache.`);
                } else {
                    console.log(`Cached deals for page ${pageToFetch} expired, fetching new data.`);
                    localStorage.removeItem(dealsCacheKey);
                }
            } catch (e) {
                console.error(`Failed to parse cached deals data for page ${pageToFetch}:`, e);
                localStorage.removeItem(dealsCacheKey);
            }
        }

        // Try loading stores from cache
        const cachedStores = localStorage.getItem(storesCacheKey);
        if (cachedStores) {
            try {
                const { data, timestamp } = JSON.parse(cachedStores);
                if (Date.now() - timestamp < CACHE_EXPIRATION_MS) {
                    storesData = data;
                    storesFromCache = true;
                    console.log("Store data loaded from cache.");
                } else {
                    console.log("Cached store data expired, fetching new data.");
                    localStorage.removeItem(storesCacheKey);
                }
            } catch (e) {
                console.error("Failed to parse cached store data:", e);
                localStorage.removeItem(storesCacheKey);
            }
        }

        try {
            // Fetch deals if not from cache
            if (!dealsFromCache) {
                console.log(`Fetching deals from API for page ${pageToFetch}...`);
                const dealsRes = await fetch(`http://localhost:4000/api/deals?page=${pageToFetch}`);
                if (!dealsRes.ok) {
                    throw new Error(`Failed to fetch deals! Status: ${dealsRes.status}`);
                }
                dealsData = await dealsRes.json();
                localStorage.setItem(dealsCacheKey, JSON.stringify({ data: dealsData, timestamp: Date.now() }));
            }

            // Fetch stores if not from cache
            if (!storesFromCache) {
                console.log("Fetching store data from API...");
                const storesRes = await fetch('http://localhost:4000/api/stores');
                if (!storesRes.ok) {
                    throw new Error(`Failed to fetch store data! Status: ${storesRes.status}`);
                }
                storesData = await storesRes.json();
                // CheapShark stores API often returns an object where keys are storeIDs
                if (!Array.isArray(storesData)) {
                    storesData = Object.values(storesData) as Store[]; // Convert object of stores to array
                }
                storesData = storesData.filter(store => store.isActive); // Only active stores
                localStorage.setItem(storesCacheKey, JSON.stringify({ data: storesData, timestamp: Date.now() }));
            }

            setAllDeals(dealsData);
            setStores(storesData);

            setHasPreviousPage(pageToFetch > 0);
            // If the number of deals returned is less than ITEMS_PER_PAGE, it's the last page
            setIsLastPage(dealsData.length < ITEMS_PER_PAGE);
            setHasNextPage(dealsData.length === ITEMS_PER_PAGE); // Only enable next if a full page was returned

        } catch (err) {
            console.error("Error fetching data:", err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred during data fetching.');
            }
            // Reset states on error
            setAllDeals([]);
            setStores([]);
            setHasPreviousPage(false);
            setHasNextPage(false);
            setIsLastPage(true); // Treat as last page on error to prevent endless attempts
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    }, []); 

    // Effect to trigger fetching when currentPage changes
    useEffect(() => {
        fetchDealsAndStores(currentPage);
    }, [currentPage, fetchDealsAndStores]);

    
    const handleNextPage = () => {
        if (!loading && hasNextPage) {
            setCurrentPage(prevPage => prevPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (!loading && hasPreviousPage) {
            setCurrentPage(prevPage => prevPage - 1);
        }
    };

    
    const handlePageClick = () => {
        setIsEditingPage(true);
        setPageInput(String(currentPage + 1)); // Display 1-indexed page
        setTimeout(() => {
            pageInputRef.current?.focus();
            pageInputRef.current?.select();
        }, 0);
    };

    const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        
        setPageInput(e.target.value);
    };

    const handlePageInputSubmit = async (e: React.KeyboardEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
        if (e.type === 'blur' || (e.type === 'keydown' && (e as React.KeyboardEvent).key === 'Enter')) {
            const pageNum = parseInt(pageInput);
            const isValidPage = !isNaN(pageNum) && pageNum >= 1;

            if (isValidPage) {
                setCurrentPage(pageNum - 1); 
            } else {
                console.warn(`Invalid page number: ${pageInput}.`);
                setPageInput(String(currentPage + 1)); 
            }
            setIsEditingPage(false);
        }
    };

    
    const applyFiltersAndSort = useCallback(() => {
        let currentDeals = [...allDeals]; 

        
        if (searchTerm) {
            currentDeals = currentDeals.filter(deal =>
                deal.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        
        if (selectedStoreID) {
            currentDeals = currentDeals.filter(deal => deal.storeID === selectedStoreID);
        }

        

        
        currentDeals = currentDeals.filter(deal => {
            const salePrice = parseFloat(deal.salePrice || '0');
            return salePrice >= minSalePrice && salePrice <= maxSalePrice;
        });

        currentDeals.sort((a, b) => {
            switch (sortOrder) {
                case 'salePriceAsc':
                    return parseFloat(a.salePrice || '0') - parseFloat(b.salePrice || '0');
                case 'salePriceDesc':
                    return parseFloat(b.salePrice || '0') - parseFloat(a.salePrice || '0');
                
                case 'releaseDateDesc':
                    return (b.releaseDate || 0) - (a.releaseDate || 0); 
                case 'releaseDateAsc':
                    return (a.releaseDate || 0) - (b.releaseDate || 0);
                default:
                    return 0; 
            }
        });

        return currentDeals;
    }, [allDeals, searchTerm, selectedStoreID, minSalePrice, maxSalePrice, sortOrder]); 

    const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
    useEffect(() => {
        const newFilteredDeals = applyFiltersAndSort();
        setFilteredDeals(newFilteredDeals);
    }, [allDeals, searchTerm, selectedStoreID, minSalePrice, maxSalePrice, sortOrder, applyFiltersAndSort]); 


    const storeMap = new Map<string, Store>();
    stores.forEach(store => {
        storeMap.set(store.storeID, store);
    });

    const showLoadingOverlay = loading && allDeals.length === 0 && !error;
    const showErrorMessage = error && allDeals.length === 0;

    return (
        <section className="flex flex-shrink flex-col items-center py-8 px-4 bg-gray-950 text-gray-100 min-h-screen relative">
            
            {showLoadingOverlay && (
                <div className="flex flex-col items-center justify-center h-full min-h-screen p-8 bg-slate-950 text-gray-100">
                    <LoadingSpinner />
                    <p className="mt-4 text-lg">Loading games...</p>
                </div>
            )}

            
            {showErrorMessage && (
                <div className="absolute inset-0 bg-gray-950 bg-opacity-90 flex flex-col items-center justify-center z-50 transition-opacity duration-300">
                    <p className="text-xl text-red-500">Error: {error}</p>
                    <p className="text-md text-gray-400 mt-2">Please check your network connection or the API endpoint.</p>
                </div>
            )}

            
            {!showLoadingOverlay && !showErrorMessage && (
                <>
                    
                    <div className="max-w-3xl text-center space-y-6 mb-8">
                        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                            Discover the{" "}
                            <span className="bg-gradient-to-r from-blue-500 to-cyan-400 text-transparent bg-clip-text">
                                Best Game Deals
                            </span>{" "}
                            Today
                        </h1>
                        <p className="text-slate-400 text-lg">
                            Browse our constantly updated catalog of video game deals from across the web. We scour top retailers like Steam, Epic Games, and Humble Bundle to bring you the lowest prices, so you can expand your library without breaking the bank. Find your next game for less!
                        </p>
                    </div>

                    
                    <div className="w-full max-w-7xl mx-auto mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-900 rounded-lg shadow-inner"> {/* Adjusted grid-cols to 3 */}
                        
                        <div className="col-span-full">
                            <input
                                type="text"
                                placeholder="Search for games..."
                                className="w-full py-2 px-3 rounded-md bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out placeholder-gray-400 cursor-pointer"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        
                        <div>
                            <label htmlFor="store-filter" className="block text-sm font-medium text-gray-400 mb-1">Filter by Store</label>
                            <select
                                id="store-filter"
                                className="w-full py-2 px-3 rounded-md bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                value={selectedStoreID}
                                onChange={(e) => setSelectedStoreID(e.target.value)}
                            >
                                <option value="">All Stores</option>
                                {stores.map(store => (
                                    <option key={store.storeID} value={store.storeID}>{store.storeName}</option>
                                ))}
                            </select>
                        </div>

                        

                        
                        <div>
                            <label htmlFor="price-range-filter" className="block text-sm font-medium text-gray-400 mb-1">Price Range: ${minSalePrice.toFixed(2)} - ${maxSalePrice.toFixed(2)}</label>
                            <div className="flex items-center gap-2">
                                <input
                                    id="min-price-filter"
                                    type="range"
                                    min="0"
                                    max="60"
                                    step="1"
                                    value={minSalePrice}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        setMinSalePrice(val);
                                        if (val > maxSalePrice) setMaxSalePrice(val);
                                    }}
                                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-700 accent-blue-500"
                                />
                                <input
                                    id="max-price-filter"
                                    type="range"
                                    min="0"
                                    max="60"
                                    step="1"
                                    value={maxSalePrice}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        setMaxSalePrice(val);
                                        if (val < minSalePrice) setMinSalePrice(val);
                                    }}
                                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-700 accent-blue-500"
                                />
                            </div>
                        </div>

                        
                        <div>
                            <label htmlFor="sort-order" className="block text-sm font-medium text-gray-400 mb-1">Sort By</label>
                            <select
                                id="sort-order"
                                className="w-full py-2 px-3 rounded-md bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                            >
                                
                                <option value="salePriceAsc">Price (Low to High)</option>
                                <option value="salePriceDesc">Price (High to Low)</option>
                                <option value="releaseDateDesc">Release Date (Newest First)</option>
                                <option value="releaseDateAsc">Release Date (Oldest First)</option>
                            </select>
                        </div>
                    </div>

                    
                    <div className="w-full max-w-7xl mx-auto p-4 overflow-x-auto">
                        <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead className="bg-gray-800">
                                    <tr className='divide-x'>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Store
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Title
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Rating
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Release Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-gray-900 divide-y divide-gray-800 text-gray-200">
                                    {filteredDeals.length > 0 ? (
                                        filteredDeals.map((deal) => {
                                            const associatedStore = storeMap.get(deal.storeID);
                                            return (
                                                <DealRow key={deal.dealID} deal={deal} storeInfo={associatedStore} />
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-gray-400">
                                                {searchTerm || selectedStoreID || minSalePrice > 0 || maxSalePrice < 60
                                                    ? "No deals match your current filters on this page."
                                                    : "No deals found for this page."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    
                    <div className="flex justify-center items-center mt-8 gap-4">
                        <button
                            onClick={handlePreviousPage}
                            disabled={loading || !hasPreviousPage}
                            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                            Previous
                        </button>

                        {isEditingPage ? (
                            <input
                                ref={pageInputRef}
                                type="number"
                                value={pageInput}
                                onChange={handlePageInputChange}
                                onKeyDown={handlePageInputSubmit}
                                onBlur={handlePageInputSubmit}
                                min="1"
                                className="w-20 text-center px-2 py-1 rounded-md bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text"
                                disabled={loading}
                            />
                        ) : (
                            <span
                                className="text-lg font-medium text-slate-200 cursor-pointer"
                                onClick={handlePageClick}
                            >
                                Page {currentPage + 1}
                            </span>
                        )}

                        <button
                            onClick={handleNextPage}
                            disabled={loading || isLastPage || !hasNextPage}
                            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center cursor-pointer"
                        >
                            Next
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 ml-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </button>
                    </div>
                </>
            )}
        </section>
    );
};

export default DealsList;