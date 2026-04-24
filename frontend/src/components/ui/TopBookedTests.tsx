import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TestCard } from '../TestCard';
import api from '../../services/api';
import { useCart } from '../../hooks/useCart';

interface Test {
  id: number;
  testName?: string;
  name?: string;
  testCode?: string;
  slug?: string;
  price?: number;
  originalPrice?: number;
  parametersCount?: number;
  discountPercent?: number;
  category?: string;
  categoryName?: string;
  sampleType?: string;
  turnaroundTime?: string;
  reportTimeHours?: number;
  fastingRequired?: boolean;
  isTopBooked?: boolean;
  isTopDeal?: boolean;
  isPackage?: boolean;
}

const SkeletonCard = () => (
  <div className="shrink-0 w-[180px] h-[240px] bg-white rounded-2xl border border-slate-100 animate-pulse overflow-hidden">
    <div className="p-4 space-y-3">
      <div className="w-8 h-8 bg-slate-100 rounded-lg" />
      <div className="h-4 bg-slate-100 rounded w-full" />
      <div className="h-4 bg-slate-100 rounded w-3/4" />
      <div className="h-10 bg-slate-100 rounded-lg mt-4" />
    </div>
  </div>
);

const TopBookedTests: React.FC = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addTest } = useCart();
  const scrollRef = useRef<HTMLDivElement>(null);
  const isHovered = useRef(false);

  // Mouse drag scroll state
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (scrollRef.current && !isHovered.current && !isDragging.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 2) {
          scrollRef.current.scrollLeft = 0;
        } else {
          scrollRef.current.scrollLeft += 1.2;
        }
      }
    }, 35);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadTests = async () => {
      try {
        const res = await api.get('/api/lab-tests/trending');
        const data: Test[] = Array.isArray(res.data?.data) ? res.data.data : [];
        if (data.length > 0) {
          setTests(data.slice(0, 12));
        } else {
          throw new Error('empty');
        }
      } catch {
        try {
          const res2 = await api.get('/api/lab-tests', { params: { page: 0, size: 12 } });
          const content: Test[] = res2.data?.data?.content ?? [];
          setTests(content);
        } catch {
          setTests([]);
        }
      } finally {
        setLoading(false);
      }
    };
    loadTests();
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
    scrollRef.current.style.cursor = 'grabbing';
  };
  const onMouseLeave = () => {
    isDragging.current = false;
    isHovered.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab';
  };
  const onMouseUp = () => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab';
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.4;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'right' ? 440 : -440, behavior: 'smooth' });
  };

  return (
    <div className="w-full">
      <div 
        className="relative" 
        onMouseEnter={() => (isHovered.current = true)} 
        onMouseLeave={onMouseLeave}
      >
        {/* Left arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:shadow-lg transition-all"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>

        {/* Card row */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 select-none no-scrollbar px-1"
          style={{ cursor: 'grab' }}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : [...tests, ...tests].map((test, idx) => (
                <div key={`${test.id}-${idx}`} className="shrink-0 w-[180px]">
                  <TestCard
                    variant="small"
                    test={{
                      id: test.id,
                      name: test.testName || test.name || 'Unknown',
                      slug: test.testCode || test.slug || String(test.id),
                      category: test.categoryName || test.category || 'Blood',
                      price: test.price || 0,
                      originalPrice: test.originalPrice || Math.round((test.price || 0) * 1.3),
                      shortDesc: '',
                      sampleType: test.sampleType || 'Blood',
                      fastingRequired: test.fastingRequired || false,
                      turnaroundTime: test.turnaroundTime || (test.reportTimeHours ? `${test.reportTimeHours}h` : '24h'),
                      rating: 4.8,
                      parametersCount: test.parametersCount || 1,
                      isTopBooked: true,
                      isTopDeal: test.isTopDeal,
                      isPackage: test.isPackage
                    }}
                    onViewDetails={(slug) => navigate(`/test/${slug}`)}
                    onBook={async () => {
                      await addTest(
                        test.id,
                        test.testName || test.name || 'Test',
                        Number(test.price || 0),
                        1
                      );
                    }}
                  />
                </div>
              ))
          }
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:shadow-lg transition-all"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TopBookedTests;
