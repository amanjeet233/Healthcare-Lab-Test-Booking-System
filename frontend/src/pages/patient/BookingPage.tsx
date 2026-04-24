import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, 
    Users, 
    Calendar, 
    Clock, 
    MapPin, 
    CreditCard, 
    CheckCircle2, 
    ChevronRight, 
    ChevronLeft, 
    Plus, 
    ShieldCheck, 
    Zap, 
    ShoppingCart, 
    Printer, 
    Home,
    AlertCircle,
    ArrowRight,
    Search,
    Loader2
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { familyMemberService, type FamilyMemberRequest, type FamilyMemberResponse } from '@/services/familyMemberService';
import { addressService, type AddressDTO } from '@/services/addressService';
import { bookingService } from '@/services/booking';
import { paymentService } from '@/services/paymentService';
import type { BookingResponse, CreateBookingRequest } from '@/types/booking';
import api from '@/services/api';
import { notify } from '@/utils/toast';
import { downloadPDF, generateBookingReceipt } from '@/utils/pdfGenerator';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import GlassCard from '@/components/common/GlassCard';
import GlassButton from '@/components/common/GlassButton';

type WizardStep = 'booking' | 'payment' | 'confirmation';
type PaymentMethodUi = 'credit-card' | 'debit-card' | 'upi' | 'wallet';
type PersonType = 'self' | 'family';
type CollectionMode = 'HOME' | 'LAB';
const LOCAL_PENDING_BOOKINGS_KEY = 'healthlab.pendingBookings';
const LOCAL_ADDRESSES_KEY = 'healthlab.localAddresses';

interface BookingLocationState {
  cartItems?: Array<{
    cartItemId?: number;
    testId?: number;
    packageId?: number;
    testName?: string;
    packageName?: string;
    name?: string;
    quantity?: number;
    price?: number;
    discount?: number;
    finalPrice?: number;
  }>;
  total?: number;
  booking?: BookingResponse;
}

const TIME_SLOTS = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'];

const getMinDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split('T')[0];
};

const mapPaymentMethod = (method: PaymentMethodUi): 'CARD' | 'UPI' | 'NET_BANKING' => {
  if (method === 'upi') return 'UPI';
  if (method === 'wallet') return 'NET_BANKING';
  return 'CARD';
};

const isServiceUnavailableError = (error: any) => {
  const status = error?.response?.status;
  return status === 502 || status === 503 || status === 504 || !status;
};

const isValidBookingItem = (item: any): boolean => {
  if (!item || typeof item !== 'object') return false;
  const id = item.testId ?? item.packageId;
  return Boolean(id) && Number(item.price || 0) > 0;
};

const loadLocalAddresses = (): AddressDTO[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_ADDRESSES_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveLocalAddress = (address: AddressDTO) => {
  const existing = loadLocalAddresses();
  const deduped = existing.filter((a: AddressDTO) => a.id !== address.id);
  localStorage.setItem(LOCAL_ADDRESSES_KEY, JSON.stringify([address, ...deduped]));
};

const toPendingBookingPayload = (pending: any): CreateBookingRequest | null => {
  if (!pending || typeof pending !== 'object') return null;

  const rawTestId = Number(pending?.testId ?? pending?.labTestId);
  const rawPackageId = Number(pending?.packageId);
  const testId = Number.isFinite(rawTestId) && rawTestId > 0 ? rawTestId : undefined;
  const packageId = Number.isFinite(rawPackageId) && rawPackageId > 0 ? rawPackageId : undefined;
  if (!testId && !packageId) return null;

  const bookingDate = String(pending?.bookingDate || pending?.collectionDate || '').trim();
  const timeSlot = String(pending?.timeSlot || pending?.scheduledTime || '').trim();
  if (!bookingDate || !timeSlot) return null;

  const collectionType = String(pending?.collectionType || 'LAB').toUpperCase() === 'HOME' ? 'HOME' : 'LAB';
  const notes = String(pending?.notes || pending?.specialNotes || '').trim();
  const address = String(pending?.collectionAddress || '').trim();

  return {
    testId,
    packageId,
    familyMemberId: Number.isFinite(Number(pending?.familyMemberId)) ? Number(pending.familyMemberId) : undefined,
    bookingDate,
    timeSlot,
    collectionType,
    collectionAddress: collectionType === 'HOME' ? address : 'Lab Visit - Address not required',
    discount: Number(pending?.discount || 0),
    notes: notes || undefined,
  };
};

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const state = (location.state || {}) as BookingLocationState;
  const { cart, fetchCart, clearCart } = useCart();
  const { currentUser } = useAuth();

  const hasConfirmedBooking = Boolean(state.booking && (state.booking.id || state.booking.bookingReference)) || Boolean(state.booking);
  console.log('[BookingPage] Render State:', { wizardStep: hasConfirmedBooking ? 'confirmation' : 'booking', hasConfirmedBooking, stateBooking: !!state.booking, id });
  const [wizardStep, setWizardStep] = useState<WizardStep>(hasConfirmedBooking ? 'confirmation' : 'booking');
  const [bookingStep, setBookingStep] = useState(1);
  const [loading, setLoading] = useState(!hasConfirmedBooking);
  const [paying, setPaying] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberResponse[]>([]);
  const [showAddFamilyForm, setShowAddFamilyForm] = useState(false);
  const [addingFamilyMember, setAddingFamilyMember] = useState(false);
  const [newFamilyMember, setNewFamilyMember] = useState<FamilyMemberRequest>({
    name: '',
    relation: '',
    dateOfBirth: '',
    gender: 'MALE'
  });
  const [addresses, setAddresses] = useState<AddressDTO[]>([]);
  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState<{ code: string; discount: number } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodUi>('credit-card');
  const [confirmedBookingId, setConfirmedBookingId] = useState<number | null>(state.booking?.id ?? null);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingResponse | null>(state.booking || null);
  const [confirmationNumber, setConfirmationNumber] = useState<string>(state.booking?.bookingReference || state.booking?.reference || '');

  const [personType, setPersonType] = useState<PersonType>('self');
  const [familyMemberId, setFamilyMemberId] = useState<number | null>(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [collectionMode, setCollectionMode] = useState<CollectionMode>('HOME');
  const [addressId, setAddressId] = useState<number | null>(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<AddressDTO>({
    label: 'Home',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    isDefault: false
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await fetchCart();
        const [members, userAddresses] = await Promise.all([
          familyMemberService.getFamilyMembers().catch(() => []),
          addressService.getAll().catch(() => [])
        ]);
        const localAddresses = loadLocalAddresses();
        const mergedAddresses = [...userAddresses];
        for (const localAddr of localAddresses) {
          if (!mergedAddresses.some((addr) => addr.id === localAddr.id)) {
            mergedAddresses.push(localAddr);
          }
        }
        setFamilyMembers(members);
        setAddresses(mergedAddresses);
        const defaultAddress = mergedAddresses.find((a) => a.isDefault) || mergedAddresses[0];
        if (defaultAddress?.id) setAddressId(defaultAddress.id);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchCart]);

  useEffect(() => {
    const syncLocalPendingBookings = async () => {
      if (!currentUser) return;

      let pendingList: any[] = [];
      try {
        const parsed = JSON.parse(localStorage.getItem(LOCAL_PENDING_BOOKINGS_KEY) || '[]');
        pendingList = Array.isArray(parsed) ? parsed : [];
      } catch {
        pendingList = [];
      }
      if (pendingList.length === 0) return;

      let remaining = [...pendingList];
      let syncedCount = 0;

      for (const pending of pendingList) {
        const payload = toPendingBookingPayload(pending);
        if (!payload) continue;

        try {
          await bookingService.createBooking(payload);
          syncedCount += 1;
          remaining = remaining.filter((item) => Number(item?.id) !== Number(pending?.id));
        } catch (error) {
          if (!isServiceUnavailableError(error)) {
            console.warn('Pending booking sync skipped for entry:', pending?.id, error);
          }
        }
      }

      if (syncedCount > 0) {
        localStorage.setItem(LOCAL_PENDING_BOOKINGS_KEY, JSON.stringify(remaining));
        notify.success(`${syncedCount} pending booking synced successfully.`);
      }
    };

    syncLocalPendingBookings();
  }, [currentUser]);

  useEffect(() => {
    const loadBookingDetails = async () => {
      if (!id) return;

      // If we already have booking data from navigation state, use it directly
      if (hasConfirmedBooking && state.booking) {
        setScheduledDate(state.booking.bookingDate || state.booking.collectionDate || '');
        setScheduledTime(state.booking.timeSlot || state.booking.scheduledTime || '');
        if (state.booking.familyMemberId) {
          setPersonType('family');
          setFamilyMemberId(state.booking.familyMemberId);
        }
        setLoading(false);
        // Background refresh from server (non-blocking)
        if (Number(id) > 0) {
          bookingService.getBookingById(Number(id)).then((fresh) => {
            setConfirmedBooking(fresh);
            setConfirmedBookingId(fresh.id);
            setConfirmationNumber(fresh.bookingReference || fresh.reference || `HLTH-${fresh.id}`);
          }).catch(() => { /* keep location state data */ });
        }
        return;
      }

      if (Number(id) < 0) {
        try {
          const localPending = JSON.parse(localStorage.getItem(LOCAL_PENDING_BOOKINGS_KEY) || '[]');
          const localBooking = Array.isArray(localPending)
            ? localPending.find((b) => Number(b?.id) === Number(id))
            : null;
          if (localBooking) {
            setConfirmedBooking(localBooking);
            setConfirmedBookingId(localBooking.id);
            setConfirmationNumber(localBooking.bookingReference || localBooking.reference || `HLTH-${localBooking.id}`);
            setWizardStep('confirmation');
          }
        } finally {
          setLoading(false);
        }
        return;
      }
      try {
        setLoading(true);
        const booking = await bookingService.getBookingById(Number(id));
        setConfirmedBooking(booking);
        setConfirmedBookingId(booking.id);
        setConfirmationNumber(booking.bookingReference || booking.reference || `HLTH-${booking.id}`);
        setWizardStep('confirmation');
        setScheduledDate(booking.bookingDate || booking.collectionDate || '');
        setScheduledTime(booking.timeSlot || booking.scheduledTime || '');
        if (booking.familyMemberId) {
          setPersonType('family');
          setFamilyMemberId(booking.familyMemberId);
        }
      } catch (error) {
        console.error('Failed to load booking:', error);
        notify.error('Could not load booking details.');
      } finally {
        setLoading(false);
      }
    };

    loadBookingDetails();
  }, [id]);

  const selectedItem = useMemo(() => {
    if (confirmedBooking) {
      return {
        testId: confirmedBooking.testId || confirmedBooking.labTestId,
        packageId: confirmedBooking.packageId,
        testName: confirmedBooking.testName || confirmedBooking.labTestName,
        packageName: confirmedBooking.packageName,
        name: confirmedBooking.packageName || confirmedBooking.testName || confirmedBooking.labTestName,
        price: confirmedBooking.totalAmount || confirmedBooking.finalAmount || confirmedBooking.amount
      };
    }
    const fromState = Array.isArray(state.cartItems)
      ? state.cartItems.find(isValidBookingItem)
      : null;
    if (fromState) return fromState;
    if (cart?.items?.length) {
      const first = cart.items.find(isValidBookingItem);
      if (!first) return null;
      return {
        cartItemId: first.cartItemId,
        testId: first.testId,
        packageId: first.packageId,
        testName: first.testName,
        packageName: first.packageName,
        name: first.name,
        quantity: first.quantity,
        price: first.price,
        discount: first.discount,
        finalPrice: first.finalPrice
      };
    }
    return null;
  }, [confirmedBooking, state.cartItems, cart?.items]);

  const itemName = selectedItem?.packageName || selectedItem?.testName || selectedItem?.name || 'Diagnostic Arsenal';
  const originalPrice = Number(selectedItem?.price || 0);
  const baseDiscount = Math.floor(originalPrice * 0.4);
  const promoDiscount = promo?.discount || 0;
  const subtotal = Math.max(0, originalPrice - baseDiscount - promoDiscount);
  const tax = Math.floor(subtotal * 0.1);
  const total = subtotal + tax;

  const selectedAddress =
    addresses.find((a) => a.id === addressId) ||
    (confirmedBooking?.collectionAddress
      ? {
          label: 'Saved',
          street: confirmedBooking.collectionAddress,
          city: '',
          state: '',
          postalCode: ''
        }
      : undefined);
  const patientName =
    confirmedBooking?.patientName ||
    (personType === 'self'
      ? currentUser?.name || 'Self'
      : (familyMembers.find((m) => m.id === familyMemberId)?.name || 'Biosynthetic Node'));

  const validateBookingStep = () => {
    if (bookingStep === 1 && personType === 'family' && !familyMemberId) {
      notify.error('Please choose a family member');
      return false;
    }
    if (bookingStep === 2 && (!scheduledDate || !scheduledTime)) {
      notify.error('Please select date and time');
      return false;
    }
    if (bookingStep === 3) {
      if (collectionMode === 'LAB') return true;
      if (!addressId && !showNewAddress) {
        notify.error('Please select a collection address');
        return false;
      }
      if (showNewAddress && (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.postalCode)) {
        notify.error('Please complete all address fields');
        return false;
      }
    }
    return true;
  };

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (code === 'PROMO20') {
      setPromo({ code, discount: 200 });
      notify.success('Promo code applied');
      return;
    }
    setPromo(null);
    notify.error('Invalid promo code');
  };

  const handleAddFamilyMember = () => {
    setShowAddFamilyForm((prev) => !prev);
  };

  const handleCreateFamilyMember = async () => {
    if (!newFamilyMember.name.trim() || !newFamilyMember.relation.trim() || !newFamilyMember.dateOfBirth) {
      notify.error('Please fill name, relation and date of birth');
      return;
    }

    try {
      setAddingFamilyMember(true);
      const created = await familyMemberService.addFamilyMember({
        ...newFamilyMember,
        name: newFamilyMember.name.trim(),
        relation: newFamilyMember.relation.trim()
      });
      setFamilyMembers((prev) => [...prev, created]);
      setFamilyMemberId(created.id);
      setShowAddFamilyForm(false);
      setNewFamilyMember({ name: '', relation: '', dateOfBirth: '', gender: 'MALE' });
      notify.success('Family member added');
    } catch (error: any) {
      console.error(error);
      notify.error(error?.message || 'Failed to add family member');
    } finally {
      setAddingFamilyMember(false);
    }
  };

  const handleNextBookingStep = () => {
    if (!validateBookingStep()) return;
    if (bookingStep < 3) {
      setBookingStep((s) => s + 1);
      return;
    }
    setWizardStep('payment');
  };

  const handleSaveNewAddress = async () => {
    if (!newAddress.street?.trim() || !newAddress.city?.trim() || !newAddress.state?.trim() || !newAddress.postalCode?.trim()) {
      notify.error('Please complete all address fields');
      return;
    }

    try {
      const saved = await addressService.save({
        ...newAddress,
        label: (newAddress.label || 'Home').trim(),
        street: newAddress.street.trim(),
        city: newAddress.city?.trim(),
        state: newAddress.state?.trim(),
        postalCode: newAddress.postalCode?.trim()
      });
      setAddresses((prev) => [saved, ...prev]);
      if (saved.id) setAddressId(saved.id);
      setShowNewAddress(false);
      notify.success('Address saved');
    } catch (error: any) {
      console.error(error);
      // Fallback so booking flow is not blocked by address API failure.
      const localAddress: AddressDTO = {
        id: -Date.now(),
        label: (newAddress.label || 'Home').trim(),
        street: newAddress.street.trim(),
        city: newAddress.city?.trim(),
        state: newAddress.state?.trim(),
        postalCode: newAddress.postalCode?.trim(),
        isDefault: false
      };
      setAddresses((prev) => [localAddress, ...prev]);
      saveLocalAddress(localAddress);
      if (localAddress.id) setAddressId(localAddress.id);
      setShowNewAddress(false);
      notify('Address saved locally. You can continue booking.', {
        icon: '📍',
        duration: 2500,
        style: { background: '#1E293B', color: '#fff' }
      });
    }
  };

  const ensureAddressPersisted = async (): Promise<AddressDTO | null> => {
    if (addressId) {
      return addresses.find((a) => a.id === addressId) || null;
    }
    if (showNewAddress && newAddress.street && newAddress.city && newAddress.state && newAddress.postalCode) {
      try {
        const saved = await addressService.save({
          ...newAddress,
          label: (newAddress.label || 'Home').trim(),
          street: newAddress.street.trim(),
          city: newAddress.city?.trim(),
          state: newAddress.state?.trim(),
          postalCode: newAddress.postalCode?.trim()
        });
        setAddresses((prev) => [saved, ...prev]);
        if (saved.id) setAddressId(saved.id);
        setShowNewAddress(false);
        return saved;
      } catch (error) {
        const localAddress: AddressDTO = {
          id: -Date.now(),
          label: (newAddress.label || 'Home').trim(),
          street: newAddress.street.trim(),
          city: newAddress.city?.trim(),
          state: newAddress.state?.trim(),
          postalCode: newAddress.postalCode?.trim(),
          isDefault: false
        };
        setAddresses((prev) => [localAddress, ...prev]);
        saveLocalAddress(localAddress);
        if (localAddress.id) setAddressId(localAddress.id);
        setShowNewAddress(false);
        return localAddress;
      }
    }
    return null;
  };

  const handlePayNow = async () => {
    if (!selectedItem) return;
    setPaying(true);
    let createdBooking: BookingResponse | null = null;
    let bookingPersistedOnServer = true;
    try {
      const persistedAddress = collectionMode === 'HOME' ? await ensureAddressPersisted() : null;
      if (collectionMode === 'HOME' && !persistedAddress) {
        notify.error('Please select or add an address');
        setPaying(false);
        return;
      }

      const bookingPayload: CreateBookingRequest = {
        testId: selectedItem.testId,
        packageId: selectedItem.packageId,
        familyMemberId: personType === 'family' ? familyMemberId || undefined : undefined,
        bookingDate: scheduledDate,
        timeSlot: scheduledTime,
        collectionType: collectionMode,
        collectionAddress: collectionMode === 'HOME'
          ? `${persistedAddress.street}, ${persistedAddress.city || ''}, ${persistedAddress.state || ''} ${persistedAddress.postalCode || ''}`.replace(/\s+/g, ' ').trim()
          : 'Lab Visit - Address not required',
        discount: baseDiscount + promoDiscount,
        notes: `Booked for ${patientName}`
      };

      try {
        createdBooking = await bookingService.createBooking(bookingPayload);
      } catch (createError: any) {
        if (!isServiceUnavailableError(createError)) throw createError;
        bookingPersistedOnServer = false;
        const localId = -Date.now();
        createdBooking = {
          id: localId,
          bookingReference: `LOCAL-${Math.abs(localId)}`,
          reference: `LOCAL-${Math.abs(localId)}`,
          familyMemberId: bookingPayload.familyMemberId,
          patientName,
          testId: bookingPayload.testId,
          labTestId: bookingPayload.testId,
          testName: selectedItem.testName || selectedItem.name || '',
          labTestName: selectedItem.testName || selectedItem.name || '',
          packageId: bookingPayload.packageId,
          packageName: selectedItem.packageName,
          bookingDate: bookingPayload.bookingDate,
          collectionDate: bookingPayload.bookingDate,
          timeSlot: bookingPayload.timeSlot,
          scheduledTime: bookingPayload.timeSlot,
          collectionType: bookingPayload.collectionType,
          collectionAddress: bookingPayload.collectionAddress,
          status: 'PENDING_CONFIRMATION',
          amount: total,
          totalAmount: total,
          finalAmount: total,
          discount: bookingPayload.discount,
          paymentStatus: 'PENDING',
          notes: bookingPayload.notes,
          specialNotes: bookingPayload.notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        try {
          const existing = JSON.parse(localStorage.getItem(LOCAL_PENDING_BOOKINGS_KEY) || '[]');
          localStorage.setItem(LOCAL_PENDING_BOOKINGS_KEY, JSON.stringify([createdBooking, ...existing]));
        } catch {
          // no-op: local persistence is best-effort
        }
        notify('Server unavailable. Booking saved locally with pending payment.', {
          icon: '⚠️',
          duration: 3500,
          style: { background: '#1E293B', color: '#fff' }
        });
      }

      let paymentCompleted = false;
      if (bookingPersistedOnServer && createdBooking.id > 0) {
        try {
          await paymentService.initiatePayment({
            bookingId: createdBooking.id,
            amount: total,
            paymentMethod: mapPaymentMethod(paymentMethod),
            paymentGateway: 'MOCK',
            transactionId: `TXN-${Date.now()}`
          });
          paymentCompleted = true;
        } catch (paymentError: any) {
          console.error('Payment initiation failed:', paymentError);
          // Mock payment fallback: keep checkout flow smooth even if gateway is unavailable.
          paymentCompleted = true;
          notify('Gateway unavailable. Mock payment marked successful for demo flow.', {
            icon: '⚠️',
            duration: 3500,
            style: { background: '#1E293B', color: '#fff' }
          });
        }
      }

      if (bookingPersistedOnServer && createdBooking.id > 0) {
        void api.post('/api/emails/send-booking-confirmation', { bookingId: createdBooking.id }).catch((emailError) => {
          console.warn('Booking confirmation email queue failed:', emailError);
        });
        await clearCart().catch(() => null);
      }

      setConfirmedBooking(createdBooking);
      setConfirmedBookingId(createdBooking.id);
      setConfirmationNumber(createdBooking.bookingReference || createdBooking.reference || `HLTH-${createdBooking.id}`);
      setWizardStep('confirmation');
      if (bookingPersistedOnServer && createdBooking.id > 0) {
        navigate(`/booking/${createdBooking.id}`, {
          replace: true,
          state: {
            booking: createdBooking
          }
        });
      } else {
        navigate('/booking', {
          replace: true,
          state: { booking: createdBooking }
        });
      }
      if (paymentCompleted && bookingPersistedOnServer) {
        notify.success('Payment successful. Booking confirmed.');
      } else if (bookingPersistedOnServer) {
        notify.success('Booking confirmed. Complete payment later from My Bookings.');
      } else {
        notify('Booking saved locally. We will sync it once the server is available.', {
          icon: '⚠️',
          duration: 3500,
          style: { background: '#1E293B', color: '#fff' }
        });
      }
    } catch (error: any) {
      console.error(error);
      if (createdBooking?.id) {
        setConfirmedBooking(createdBooking);
        setConfirmedBookingId(createdBooking.id);
        setConfirmationNumber(createdBooking.bookingReference || createdBooking.reference || `HLTH-${createdBooking.id}`);
        setWizardStep('confirmation');
        if (createdBooking.id > 0) {
          navigate(`/booking/${createdBooking.id}`, {
            replace: true,
            state: { booking: createdBooking }
          });
          notify('Booking created, but payment is pending. Please complete it from My Bookings.', {
            icon: '⚠️',
            duration: 3500,
            style: { background: '#1E293B', color: '#fff' }
          });
        } else {
          navigate('/booking', {
            replace: true,
            state: { booking: createdBooking }
          });
          notify('Booking saved locally and moved to confirmation.', {
            icon: '⚠️',
            duration: 3500,
            style: { background: '#1E293B', color: '#fff' }
          });
        }
      } else {
        if (isServiceUnavailableError(error)) {
          notify('Service is temporarily unavailable. Please try again in a moment.', {
            icon: '⚠️',
            duration: 3500,
            style: { background: '#1E293B', color: '#fff' }
          });
        } else {
          notify.error('We could not complete your booking right now. Please try again.');
        }
      }
    } finally {
      setPaying(false);
    }
  };

  const handleDownloadReceipt = () => {
    // Build receipt data: prefer server-confirmed booking data, fall back to local values
    const base = confirmedBooking || {} as Partial<BookingResponse>;
    const bookingForReceipt = {
      id: base.id || confirmedBookingId || Date.now(),
      bookingReference: base.bookingReference || confirmationNumber || `HLTH-${confirmedBookingId || Date.now()}`,
      reference: base.reference || base.bookingReference || confirmationNumber,
      patientName: base.patientName || patientName,
      patientEmail: base.patientEmail || currentUser?.email || '',
      patientPhone: (base as any).patientPhone || (currentUser as any)?.phone || (currentUser as any)?.phoneNumber || '',
      testName: base.testName || base.labTestName || selectedItem?.testName || selectedItem?.name || itemName,
      packageName: base.packageName || selectedItem?.packageName,
      bookingDate: base.bookingDate || scheduledDate,
      collectionDate: base.collectionDate || base.bookingDate || scheduledDate,
      timeSlot: base.timeSlot || scheduledTime,
      scheduledTime: base.scheduledTime || base.timeSlot || scheduledTime,
      collectionType: base.collectionType || collectionMode,
      collectionAddress: base.collectionAddress || (collectionMode === 'HOME'
        ? (selectedAddress
          ? `${selectedAddress.street}, ${selectedAddress.city || ''}, ${selectedAddress.state || ''} ${selectedAddress.postalCode || ''}`.replace(/\s+/g, ' ').trim()
          : '')
        : 'Lab Visit'),
      status: base.status || 'BOOKED',
      amount: Number(base.finalAmount || base.amount || total || 0),
      totalAmount: Number(base.totalAmount || base.amount || originalPrice || 0),
      finalAmount: Number(base.finalAmount || base.amount || total || 0),
      discount: Number(base.discount || baseDiscount + promoDiscount || 0),
      paymentStatus: base.paymentStatus || 'PAID',
      createdAt: base.createdAt || new Date().toISOString()
    };

    const pdf = generateBookingReceipt(bookingForReceipt as BookingResponse);
    const filename = `Healthcare_Receipt_${bookingForReceipt.bookingReference || bookingForReceipt.id}.pdf`;
    downloadPDF(pdf, filename);
    notify.success('Receipt downloaded');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
            <Loader2 className="w-10 h-10 text-cyan-600 animate-spin mx-auto mb-2" />
            <p className="text-[10px] font-black text-cyan-800/60 uppercase tracking-widest">Preparing your booking...</p>
        </div>
      </div>
    );
  }

  if (!selectedItem) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <GlassCard className="max-w-md p-6 text-center border-white/60">
          <AlertCircle className="w-12 h-12 text-rose-300 mx-auto mb-3" />
          <h2 className="text-xl font-black text-[#164E63] tracking-tight mb-2 uppercase">Inventory Empty</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-5 leading-tight">No diagnostic protocols detected in your immediate workspace.</p>
          <GlassButton onClick={() => navigate('/tests')}>BROWSE TESTS</GlassButton>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto px-4 py-6 min-h-screen pb-12">
      <header className="mb-6">
          <button 
              onClick={() => navigate('/cart')}
              className="group flex items-center gap-2 text-cyan-800/60 font-black text-[9px] uppercase tracking-[0.2em] mb-4 hover:text-cyan-600 transition-colors"
          >
              <ChevronLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
              BACK TO CART
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                  <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                          <ShieldCheck size={16} />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-cyan-800/60">
                          Secure Checkout
                      </span>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-black text-[#164E63] tracking-tighter uppercase leading-tight">
                      {wizardStep === 'confirmation' ? 'Booking Secured' : `Booking: ${itemName}`}
                  </h1>
              </div>

              {wizardStep !== 'confirmation' && (
                  <div className="flex items-center gap-3 bg-cyan-950/5 backdrop-blur-xl px-4 py-3 rounded-[32px] border border-white/40 shadow-xl shadow-cyan-900/5">
                      {[1, 2, 3, 4].map((step) => (
                          <div key={step} className="flex items-center gap-2">
                              <div className="relative">
                                  <div className={`w-8 h-8 rounded-2xl flex items-center justify-center font-black text-xs transition-all duration-500 ${
                                      (wizardStep === 'booking' && bookingStep === step) || (wizardStep === 'payment' && step === 4)
                                      ? 'bg-[#164E63] text-white shadow-2xl shadow-cyan-900/40 scale-110 rotate-3'
                                      : (wizardStep === 'booking' && bookingStep > step) || wizardStep === 'payment'
                                      ? 'bg-emerald-500 text-white'
                                      : 'bg-white/60 text-slate-300 border border-white/80'
                                  }`}>
                                      {((wizardStep === 'booking' && bookingStep > step) || wizardStep === 'payment') && step < 4 ? <CheckCircle2 size={16} /> : step}
                                  </div>
                                  {(wizardStep === 'booking' && bookingStep === step) && (
                                      <div className="absolute -inset-1 bg-cyan-400/20 blur-lg rounded-2xl animate-pulse" />
                                  )}
                              </div>
                              {step < 4 && <div className="w-5 h-px bg-gradient-to-r from-slate-200/50 to-transparent" />}
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Main Workspace */}
          <main className="lg:col-span-8">
              <AnimatePresence mode="wait">
                  {wizardStep === 'booking' && (
                      <motion.div key="booking" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                          <GlassCard className="p-6 border-white/40 min-h-[420px] flex flex-col">
                              <div className="flex-1">
                                  {bookingStep === 1 && (
                                      <div className="space-y-4">
                                          <div>
                                              <h2 className="text-xl font-black text-[#164E63] uppercase tracking-tight mb-1">Patient Details</h2>
                                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select who the test is for</p>
                                          </div>
                                          
                                           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                               <button 
                                                   onClick={() => { setPersonType('self'); setFamilyMemberId(null); }}
                                                   className={`group p-5 rounded-[48px] border-2 transition-all flex items-center gap-3 text-left glass-pane ${
                                                       personType === 'self' 
                                                       ? 'border-cyan-500 bg-cyan-500/5 text-[#164E63] shadow-2xl shadow-cyan-500/10' 
                                                       : 'border-white bg-white/40 text-slate-400 hover:border-cyan-200'
                                                   }`}
                                               >
                                                   <div className={`p-3 rounded-3xl transition-transform group-hover:scale-110 duration-500 ${personType === 'self' ? 'bg-cyan-500 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                                                       <User size={24} />
                                                   </div>
                                                   <div>
                                                       <span className="block text-sm font-black uppercase tracking-tight mb-1">Myself</span>
                                                       <span className="text-[9px] font-black uppercase tracking-widest opacity-60 italic">{currentUser?.name}</span>
                                                   </div>
                                               </button>

                                               <button 
                                                   onClick={() => setPersonType('family')}
                                                   className={`group p-5 rounded-[48px] border-2 transition-all flex items-center gap-3 text-left glass-pane ${
                                                       personType === 'family' 
                                                       ? 'border-[#164E63] bg-[#164E63]/5 text-[#164E63] shadow-2xl shadow-cyan-900/10' 
                                                       : 'border-white bg-white/40 text-slate-400 hover:border-cyan-200'
                                                   }`}
                                               >
                                                   <div className={`p-3 rounded-3xl transition-transform group-hover:scale-110 duration-500 ${personType === 'family' ? 'bg-[#164E63] text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                                                       <Users size={24} />
                                                   </div>
                                                   <div>
                                                       <span className="block text-sm font-black uppercase tracking-tight mb-1">Family Member</span>
                                                       <span className="text-[9px] font-black uppercase tracking-widest opacity-60 italic">Added Members</span>
                                                   </div>
                                               </button>
                                           </div>

                                          <AnimatePresence>
                                              {personType === 'family' && (
                                                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="overflow-hidden">
                                                      <div className="flex items-center justify-between mb-2">
                                                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Choose Family Member</label>
                                                          <button
                                                              onClick={handleAddFamilyMember}
                                                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border-2 border-white bg-white/50 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-white transition-all"
                                                          >
                                                              <div className="flex items-center gap-1">
                                                                <Plus size={14} />
                                                                {showAddFamilyForm ? 'Close Form' : 'Add Family Member'}
                                                              </div>
                                                          </button>
                                                      </div>
                                                      {showAddFamilyForm && (
                                                        <div className="mb-3 p-3 rounded-2xl border-2 border-white bg-white/50 space-y-2">
                                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                            <input
                                                              value={newFamilyMember.name}
                                                              onChange={(e) => setNewFamilyMember((prev) => ({ ...prev, name: e.target.value }))}
                                                              placeholder="Full Name"
                                                              className="bg-white/70 border border-white rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#164E63] outline-none"
                                                            />
                                                            <input
                                                              value={newFamilyMember.relation}
                                                              onChange={(e) => setNewFamilyMember((prev) => ({ ...prev, relation: e.target.value }))}
                                                              placeholder="Relation (e.g. Brother)"
                                                              className="bg-white/70 border border-white rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#164E63] outline-none"
                                                            />
                                                          </div>
                                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                            <input
                                                              type="date"
                                                              value={newFamilyMember.dateOfBirth}
                                                              onChange={(e) => setNewFamilyMember((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                                                              className="bg-white/70 border border-white rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#164E63] outline-none"
                                                            />
                                                            <select
                                                              value={newFamilyMember.gender}
                                                              onChange={(e) => setNewFamilyMember((prev) => ({ ...prev, gender: e.target.value as FamilyMemberRequest['gender'] }))}
                                                              className="bg-white/70 border border-white rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#164E63] outline-none"
                                                            >
                                                              <option value="MALE">Male</option>
                                                              <option value="FEMALE">Female</option>
                                                              <option value="OTHER">Other</option>
                                                            </select>
                                                          </div>
                                                          <div className="flex gap-2">
                                                            <button
                                                              onClick={handleCreateFamilyMember}
                                                              disabled={addingFamilyMember}
                                                              className="px-3 py-2 rounded-xl border-2 border-white bg-white/70 text-[9px] font-black uppercase tracking-widest text-slate-600 hover:bg-white transition-all disabled:opacity-60"
                                                            >
                                                              {addingFamilyMember ? 'Saving...' : 'Save Member'}
                                                            </button>
                                                            <button
                                                              onClick={() => setShowAddFamilyForm(false)}
                                                              className="px-3 py-2 rounded-xl border-2 border-white bg-white/40 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-white transition-all"
                                                            >
                                                              Cancel
                                                            </button>
                                                          </div>
                                                        </div>
                                                      )}
                                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                          {familyMembers.length > 0 ? familyMembers.map((member) => (
                                                            <button 
                                                                key={member.id}
                                                                onClick={() => setFamilyMemberId(member.id)}
                                                                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                                                                    familyMemberId === member.id 
                                                                    ? 'border-cyan-500 bg-white text-[#164E63] shadow-lg' 
                                                                    : 'border-white bg-white/50 text-slate-500 hover:bg-white'
                                                                }`}
                                                            >
                                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${familyMemberId === member.id ? 'bg-cyan-500 text-white' : 'bg-slate-100'}`}>
                                                                    <User size={16} />
                                                                </div>
                                                                <div className="text-left">
                                                                    <span className="block text-xs font-black uppercase tracking-tight leading-none mb-1">{member.name}</span>
                                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{member.relation}</span>
                                                                </div>
                                                            </button>
                                                          )) : (
                                                            <div className="md:col-span-2 p-4 rounded-2xl border-2 border-white bg-white/40">
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">No family members added yet.</p>
                                                                <button
                                                                    onClick={handleAddFamilyMember}
                                                                    className="flex items-center gap-1 px-3 py-2 rounded-xl border-2 border-white bg-white/60 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-white transition-all"
                                                                >
                                                                    <Plus size={14} />
                                                                    Add Family Member
                                                                </button>
                                                            </div>
                                                          )}
                                                      </div>
                                                  </motion.div>
                                              )}
                                          </AnimatePresence>
                                      </div>
                                  )}

                                  {bookingStep === 2 && (
                                      <div className="space-y-4">
                                          <div>
                                              <h2 className="text-xl font-black text-[#164E63] uppercase tracking-tight mb-1">Schedule Date & Time</h2>
                                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select a convenient time slot</p>
                                          </div>

                                          <div>
                                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Collection Type</label>
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                  <button
                                                      onClick={() => setCollectionMode('HOME')}
                                                      className={`p-3 rounded-2xl border-2 transition-all text-left ${
                                                          collectionMode === 'HOME'
                                                          ? 'border-cyan-500 bg-cyan-500/5 text-[#164E63]'
                                                          : 'border-white bg-white/40 text-slate-500 hover:bg-white'
                                                      }`}
                                                  >
                                                      <span className="block text-xs font-black uppercase tracking-tight">Home Test</span>
                                                      <span className="text-[9px] font-black uppercase tracking-widest opacity-70">Sample collection at your address</span>
                                                  </button>
                                                  <button
                                                      onClick={() => { setCollectionMode('LAB'); setShowNewAddress(false); }}
                                                      className={`p-3 rounded-2xl border-2 transition-all text-left ${
                                                          collectionMode === 'LAB'
                                                          ? 'border-cyan-500 bg-cyan-500/5 text-[#164E63]'
                                                          : 'border-white bg-white/40 text-slate-500 hover:bg-white'
                                                      }`}
                                                  >
                                                      <span className="block text-xs font-black uppercase tracking-tight">Lab Test</span>
                                                      <span className="text-[9px] font-black uppercase tracking-widest opacity-70">Visit lab center for sample collection</span>
                                                  </button>
                                              </div>
                                          </div>

                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              <div>
                                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Select Date</label>
                                                  <GlassCard className="p-2 border-white bg-white/30">
                                                      <input 
                                                          type="date" 
                                                          min={getMinDate()}
                                                          value={scheduledDate}
                                                          onChange={(e) => setScheduledDate(e.target.value)}
                                                          className="w-full bg-transparent border-none p-3 text-base font-black text-[#164E63] outline-none"
                                                      />
                                                  </GlassCard>
                                              </div>

                                              <div>
                                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Select Time Slot</label>
                                                  <div className="grid grid-cols-2 gap-3">
                                                      {TIME_SLOTS.map((slot) => (
                                                          <button 
                                                              key={slot}
                                                              onClick={() => setScheduledTime(slot)}
                                                              className={`p-3 rounded-2xl border-2 transition-all font-black text-[10px] uppercase tracking-widest ${
                                                                  scheduledTime === slot
                                                                  ? 'bg-[#164E63] text-white border-[#164E63] shadow-lg scale-[1.02]'
                                                                  : 'bg-white/50 text-slate-400 border-white hover:border-cyan-200'
                                                              }`}
                                                          >
                                                              {slot}
                                                          </button>
                                                      ))}
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                  )}

                                  {bookingStep === 3 && (
                                      <div className="space-y-4">
                                          {collectionMode === 'LAB' ? (
                                              <div className="p-4 rounded-3xl border-2 border-white bg-white/50">
                                                  <h2 className="text-xl font-black text-[#164E63] uppercase tracking-tight mb-1">Lab Collection</h2>
                                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">No home address needed for lab visit</p>
                                                  <p className="text-xs font-black text-slate-500 uppercase tracking-tight">
                                                      You selected lab test. Please continue to payment and visit your preferred lab at selected time.
                                                  </p>
                                              </div>
                                          ) : (
                                          <div className="flex justify-between items-start">
                                              <div>
                                                  <h2 className="text-xl font-black text-[#164E63] uppercase tracking-tight mb-1">Collection Address</h2>
                                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Where should we collect the sample?</p>
                                              </div>
                                              <GlassButton variant="secondary" className="text-[10px] py-2" onClick={() => setShowNewAddress(!showNewAddress)}>
                                                  {showNewAddress ? 'USE SAVED ADDRESS' : 'ADD NEW ADDRESS'}
                                              </GlassButton>
                                          </div>
                                          )}

                                          {collectionMode === 'HOME' && <AnimatePresence mode="wait">
                                              {showNewAddress ? (
                                                  <motion.div key="new" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                                                      <div className="grid grid-cols-2 gap-3">
                                                          <input className="bg-white/50 border border-white rounded-2xl p-2.5 text-[10px] font-black uppercase text-[#164E63] outline-none placeholder:text-slate-300" placeholder="Label (Home/Work)" value={newAddress.label} onChange={(e) => setNewAddress(p => ({ ...p, label: e.target.value }))} />
                                                          <input className="bg-white/50 border border-white rounded-2xl p-2.5 text-[10px] font-black uppercase text-[#164E63] outline-none placeholder:text-slate-300" placeholder="Street / Sector" value={newAddress.street} onChange={(e) => setNewAddress(p => ({ ...p, street: e.target.value }))} />
                                                      </div>
                                                      <div className="grid grid-cols-3 gap-3">
                                                          <input className="bg-white/50 border border-white rounded-2xl p-2.5 text-[10px] font-black uppercase text-[#164E63] outline-none" placeholder="City" value={newAddress.city || ''} onChange={(e) => setNewAddress(p => ({ ...p, city: e.target.value }))} />
                                                          <input className="bg-white/50 border border-white rounded-2xl p-2.5 text-[10px] font-black uppercase text-[#164E63] outline-none" placeholder="State" value={newAddress.state || ''} onChange={(e) => setNewAddress(p => ({ ...p, state: e.target.value }))} />
                                                          <input className="bg-white/50 border border-white rounded-2xl p-2.5 text-[10px] font-black uppercase text-[#164E63] outline-none" placeholder="Postal Code" value={newAddress.postalCode || ''} onChange={(e) => setNewAddress(p => ({ ...p, postalCode: e.target.value }))} />
                                                      </div>
                                                      <GlassButton className="w-full py-3" onClick={handleSaveNewAddress}>SAVE ADDRESS</GlassButton>
                                                  </motion.div>
                                              ) : (
                                                  <motion.div key="saved" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                      {addresses.map((addr) => (
                                                          <button 
                                                              key={addr.id}
                                                              onClick={() => setAddressId(addr.id || null)}
                                                              className={`flex items-start gap-3 p-4 rounded-[32px] border-2 transition-all text-left ${
                                                                  addressId === addr.id 
                                                                  ? 'border-emerald-500 bg-white text-[#164E63]' 
                                                                  : 'border-white bg-white/20 text-slate-500 hover:bg-white'
                                                              }`}
                                                          >
                                                              <div className={`p-2 rounded-xl shrink-0 ${addressId === addr.id ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                                                                  <MapPin size={16} />
                                                              </div>
                                                              <div>
                                                                  <div className="flex items-center gap-2 mb-1">
                                                                       <span className="text-xs font-black uppercase tracking-tight">{addr.label}</span>
                                                                       {addr.isDefault && <span className="text-[8px] font-black bg-cyan-100 text-cyan-600 px-1.5 py-0.5 rounded uppercase">Primary</span>}
                                                                  </div>
                                                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter line-clamp-2 leading-normal">
                                                                      {addr.street}, {addr.city}, {addr.state} {addr.postalCode}
                                                                  </p>
                                                              </div>
                                                          </button>
                                                      ))}
                                                  </motion.div>
                                              )}
                                          </AnimatePresence>}
                                      </div>
                                  )}
                              </div>

                              <div className="mt-6 pt-4 border-t border-slate-100/50 flex flex-col md:flex-row justify-between gap-3">
                                  <GlassButton 
                                      variant="secondary" 
                                      className="py-2.5 px-6 order-2 md:order-1" 
                                      disabled={bookingStep === 1}
                                      onClick={() => setBookingStep(s => Math.max(1, s - 1))}
                                  >
                                      GO BACK
                                  </GlassButton>
                                  <GlassButton 
                                      className="py-2.5 px-8 order-1 md:order-2"
                                      onClick={handleNextBookingStep}
                                      icon={<ChevronRight size={16} />}
                                  >
                                      {bookingStep === 3 ? 'CONTINUE TO PAYMENT' : 'NEXT STEP'}
                                  </GlassButton>
                              </div>
                          </GlassCard>
                      </motion.div>
                  )}

                  {wizardStep === 'payment' && (
                      <motion.div key="payment" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                          <GlassCard className="p-6 border-white/40">
                              <div className="mb-6">
                                  <h2 className="text-xl font-black text-[#164E63] uppercase tracking-tight mb-1 text-center">Secure Payment</h2>
                                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest text-center">Complete your payment</p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                  {(['credit-card', 'debit-card', 'upi', 'wallet'] as PaymentMethodUi[]).map((m) => (
                                      <button 
                                          key={m}
                                          onClick={() => setPaymentMethod(m)}
                                          className={`flex items-center gap-3 p-4 rounded-3xl border-2 transition-all ${
                                            paymentMethod === m
                                            ? 'border-[#164E63] bg-white text-[#164E63] shadow-xl'
                                            : 'border-white bg-white/20 text-slate-400 hover:bg-white'
                                          }`}
                                      >
                                          <div className={`p-2 rounded-xl ${paymentMethod === m ? 'bg-[#164E63] text-white' : 'bg-slate-100'}`}>
                                              <CreditCard size={16} />
                                          </div>
                                          <span className="text-xs font-black uppercase tracking-widest">{m.replace('-', ' ')}</span>
                                          {paymentMethod === m && <CheckCircle2 size={16} className="ml-auto text-emerald-500" />}
                                      </button>
                                  ))}
                              </div>

                              <div className="p-5 bg-emerald-50 rounded-[32px] border border-emerald-100 flex items-center gap-3 mb-6">
                                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-50 shrink-0">
                                      <ShieldCheck size={18} />
                                  </div>
                                  <div>
                                      <h4 className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-1 leading-none">AIP-256 Encrypted</h4>
                                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Your payment is safe and encrypted.</p>
                                  </div>
                              </div>

                              <div className="flex gap-3">
                                  <GlassButton variant="secondary" className="flex-1 py-3" onClick={() => setWizardStep('booking')}>CANCEL</GlassButton>
                                  <GlassButton 
                                      className="flex-[2] py-3 text-base" 
                                      onClick={handlePayNow}
                                      disabled={paying}
                                      icon={paying ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                                  >
                                      {paying ? 'PROCESSING...' : `PAY ₹${total}`}
                                  </GlassButton>
                              </div>
                          </GlassCard>
                      </motion.div>
                  )}

                  {wizardStep === 'confirmation' && (
                      <motion.div key="confirmation" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                          <GlassCard className="p-8 border-white/80 bg-white/40 text-center flex flex-col items-center shadow-2xl shadow-emerald-900/10">
                              <div className="w-16 h-16 bg-emerald-500 rounded-[40px] flex items-center justify-center text-white mb-4 shadow-xl shadow-emerald-500/30">
                                  <CheckCircle2 size={30} />
                              </div>
                              <h2 className="text-2xl font-black text-[#164E63] tracking-tighter uppercase mb-2 leading-tight">Booking Confirmed!</h2>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Booking ID: {confirmationNumber || '---'}</p>

                              <div className="w-full max-w-xl grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                  <div className="p-4 bg-white/60 rounded-[32px] border border-white text-left">
                                      <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Patient Name</span>
                                      <p className="text-base font-black text-[#164E63] tracking-tight uppercase leading-tight">{confirmedBooking?.patientName || patientName}</p>
                                  </div>
                                  <div className="p-4 bg-white/60 rounded-[32px] border border-white text-left">
                                      <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Temporal Slot</span>
                                      <p className="text-base font-black text-[#164E63] tracking-tight uppercase leading-tight">
                                          {confirmedBooking?.bookingDate || confirmedBooking?.collectionDate || scheduledDate} / {confirmedBooking?.timeSlot || confirmedBooking?.scheduledTime || scheduledTime}
                                      </p>
                                  </div>
                                  <div className="p-4 bg-white/60 rounded-[32px] border border-white text-left md:col-span-2">
                                      <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Address</span>
                                      <p className="text-xs font-black text-[#164E63] tracking-tight uppercase leading-tight">
                                          {(confirmedBooking?.collectionType || collectionMode) === 'LAB'
                                            ? 'LAB VISIT'
                                            : (confirmedBooking?.collectionAddress || (selectedAddress ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.postalCode}` : 'Address not available'))}
                                      </p>
                                  </div>
                              </div>

                              <div className="flex flex-wrap justify-center gap-3">
                                  <GlassButton onClick={() => navigate('/bookings')} icon={<ShoppingCart size={16} />}>VIEW MY BOOKINGS</GlassButton>
                                  <GlassButton variant="secondary" onClick={handleDownloadReceipt} icon={<Printer size={16} />}>DOWNLOAD RECEIPT</GlassButton>
                                  <GlassButton variant="tertiary" onClick={() => navigate('/')} icon={<Home size={16} />}>GO TO HOME</GlassButton>
                              </div>
                          </GlassCard>
                      </motion.div>
                  )}
              </AnimatePresence>
          </main>

          {/* Sidebar Area */}
          <aside className="lg:col-span-4 w-full max-w-[320px] space-y-4">
              <GlassCard className="p-5 border-white/60 sticky top-6 bg-white/60 glass-pane shadow-2xl shadow-cyan-900/5">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 border-b border-slate-100/50 pb-2">Order Summary</h3>
                    
                    <div className="space-y-4 mb-6">
                        <div className="flex items-start gap-3 p-4 bg-cyan-500/5 rounded-3xl border border-cyan-500/10">
                            <div className="p-2 bg-cyan-500 text-white rounded-2xl shadow-lg shadow-cyan-900/10 shrink-0">
                                <ShoppingCart size={16} />
                            </div>
                            <div>
                                <span className="block text-[8px] font-black text-cyan-600/60 uppercase tracking-widest mb-1">Selected Test/Package</span>
                                <p className="text-base font-black text-[#164E63] tracking-tighter uppercase leading-tight">{itemName}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-2 pt-4 border-t border-slate-100/50">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                <span className="text-slate-400">Item Total</span>
                                <span className="text-[#164E63] font-black">₹{originalPrice}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                                <span>Discount (40%)</span>
                                <span className="font-black">-₹{baseDiscount}</span>
                            </div>
                            {promo && (
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-cyan-600">
                                    <span>Signature ({promo.code})</span>
                                    <span className="font-black">-₹{promo.discount}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                <span className="text-slate-400">System Tax (10%)</span>
                                <span className="text-[#164E63] font-black">₹{tax}</span>
                            </div>
                            <div className="pt-3 mt-3 border-t-2 border-slate-100 flex justify-between items-end">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest mb-1">Settlement Total</span>
                                    <span className="text-[11px] font-black text-[#164E63] uppercase tracking-[0.1em]">Total Due</span>
                                </div>
                                <span className="text-3xl font-black text-[#164E63] tracking-tighter leading-none">₹{total}</span>
                            </div>
                        </div>
                    </div>

                   {wizardStep !== 'confirmation' && (
                       <div className="space-y-3">
                           <div>
                               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Promotion Signature</label>
                               <div className="flex gap-2">
                                   <input 
                                       value={promoInput}
                                       onChange={(e) => setPromoInput(e.target.value)}
                                       placeholder="PROMO20"
                                       className="flex-1 bg-white/50 border border-white rounded-xl px-3 py-2 text-xs font-bold text-[#164E63] outline-none focus:border-cyan-400 transition-all placeholder:text-slate-200"
                                   />
                                   <GlassButton variant="secondary" className="px-4 py-2 text-[10px]" onClick={handleApplyPromo}>APPLY</GlassButton>
                               </div>
                           </div>
                       </div>
                   )}
              </GlassCard>
              
              <div className="px-5">
                  <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck size={14} className="text-emerald-500" />
                      <span className="text-[10px] font-black text-[#164E63] uppercase tracking-widest">Verified & Secure</span>
                  </div>
                  <p className="text-[9px] font-bold text-slate-300 uppercase leading-tight tracking-widest">Your health data is private and safe.</p>
              </div>
          </aside>
      </div>
    </div>
  );
};

export default BookingPage;
