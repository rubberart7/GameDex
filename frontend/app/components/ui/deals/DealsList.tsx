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
const CACHE_EXPIRATION_MS = 60 * 60 * 1000;
const ITEMS_PER_PAGE = 60;

const DealsList = () => {
    const [allDeals, setAllDeals] = useState<Deal[]>([]); 
    const [stores, setStores] = useState<Store[]>([]);

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState<string>('');

    const [selectedStoreID, setSelectedStoreID] = useState<string>('');
    
    const [maxSalePrice, setMaxSalePrice] = useState<number>(60);
    const [minSalePrice, setMinSalePrice] = useState<number>(0);
    
    const [sortOrder, setSortOrder] = useState<string>('salePriceAsc'); 

    const [currentPage, setCurrentPage] = useState<number>(0);
    const [hasPreviousPage, setHasPreviousPage] = useState<boolean>(false);
    const [hasNextPage, setHasNextPage] = useState<boolean>(true); 
    const [isLastPage, setIsLastPage] = useState<boolean>(false); 

    const [isEditingPage, setIsEditingPage] = useState<boolean>(false);
    const [pageInput, setPageInput] = useState<string>(String(currentPage + 1)); 
    const pageInputRef = useRef<HTMLInputElement>(null);

    const isFetchingRef = useRef(false);

    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

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

        const isLocalStorageAvailable = typeof window !== 'undefined' && window.localStorage;

        if (isLocalStorageAvailable) {
            const cachedDeals = localStorage.getItem(dealsCacheKey);
            if (cachedDeals) {
                try {
                    const { data, timestamp } = JSON.parse(cachedDeals);
                    if (Date.now() - timestamp < CACHE_EXPIRATION_MS) {
                        dealsData = data;
                        dealsFromCache = true;
                    } else {
                        localStorage.removeItem(dealsCacheKey);
                    }
                } catch (e) {
                    localStorage.removeItem(dealsCacheKey);
                }
            }

            const cachedStores = localStorage.getItem(storesCacheKey);
            if (cachedStores) {
                try {
                    const { data, timestamp } = JSON.parse(cachedStores);
                    if (Date.now() - timestamp < CACHE_EXPIRATION_MS) {
                        storesData = data;
                        storesFromCache = true;
                    } else {
                        localStorage.removeItem(storesCacheKey);
                    }
                } catch (e) {
                    localStorage.removeItem(storesCacheKey);
                }
            }
        }

        try {
            if (!dealsFromCache) {
                const dealsRes = await fetch(`${serverUrl}api/deals?page=${pageToFetch}`);
                if (!dealsRes.ok) {
                    throw new Error(`Failed to fetch deals! Status: ${dealsRes.status}`);
                }
                dealsData = await dealsRes.json();
                if (isLocalStorageAvailable) {
                    localStorage.setItem(dealsCacheKey, JSON.stringify({ data: dealsData, timestamp: Date.now() }));
                }
            }

            if (!storesFromCache) {
                const storesRes = await fetch(`${serverUrl}api/stores`);
                if (!storesRes.ok) {
                    throw new Error(`Failed to fetch store data! Status: ${storesRes.status}`);
                }
                storesData = await storesRes.json();
                if (!Array.isArray(storesData)) {
                    storesData = Object.values(storesData) as Store[];
                }
                storesData = storesData.filter(store => store.isActive);
                if (isLocalStorageAvailable) {
                    localStorage.setItem(storesCacheKey, JSON.stringify({ data: storesData, timestamp: Date.now() }));
                }
            }

            setAllDeals(dealsData);
            setStores(storesData);

            setHasPreviousPage(pageToFetch > 0);
            setIsLastPage(dealsData.length < ITEMS_PER_PAGE);
            setHasNextPage(dealsData.length === ITEMS_PER_PAGE);

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred during data fetching.');
            }
            setAllDeals([]);
            setStores([]);
            setHasPreviousPage(false);
            setHasNextPage(false);
            setIsLastPage(true);
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    }, [serverUrl]); 

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
        setPageInput(String(currentPage + 1));
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

    const showInitialLoadingOverlay = loading && allDeals.length === 0 && !error && currentPage === 0;
    const showErrorMessage = error && allDeals.length === 0;

    return (
        <section className="flex flex-shrink flex-col items-center py-8 px-4 bg-slate-950 text-gray-100 min-h-screen relative">
            {showInitialLoadingOverlay && (
                <div className="w-full flex flex-col items-center justify-center flex-1 py-20">
                    <LoadingSpinner className="text-blue-500 w-12 h-12 mb-4" />
                    <p>Loading deals...</p>
                </div>
            )}

            {showErrorMessage && (
                <div className="w-full flex flex-col items-center justify-center flex-1 py-20">
                    <div className="text-center p-8 bg-red-900/20 border border-red-500/30 rounded-lg">
                        <p className="text-red-400 text-lg">Error: {error}</p>
                        <button 
                            onClick={() => fetchDealsAndStores(currentPage)}
                            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            )}

            {!showInitialLoadingOverlay && !showErrorMessage && (
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

                    <div className="w-full max-w-7xl mx-auto mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-900 rounded-lg shadow-inner">
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

                    <div className="flex flex-col items-center mt-8">
                        <div className="flex justify-center items-center gap-4 mb-4">
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

                        {loading && allDeals.length > 0 && (
                            <div className="flex flex-col items-center justify-center py-4">
                                <LoadingSpinner className="text-blue-500 w-8 h-8 mb-2" />
                                <p className="text-gray-400 text-sm">Loading page {currentPage + 1}...</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </section>
    );
};
export default DealsList;