"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  MoreVertical,
  Trash2,
  Phone,
  Edit2,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  Eye,
  MapPin,
  Calendar,
  GraduationCap,
  User2,
  Clock,
  CreditCard,
  Percent,
  School,
  Mail,
  RefreshCw,
  Loader2,
  Search,
} from "lucide-react"
import Image from "next/image"
import { getStoredAuthData, API_BASE_URL } from "@/lib/utils"

interface Address {
  street?: string
  city?: string
  state?: string
  pincode?: string
}

interface ProfileImage {
  url: string
  cloudinaryId: string
}

interface AttendanceStats {
  present: number
  absent: number
  late: number
  halfDay: number
  percentage: number
}

interface LastLogin {
  timestamp: string
  ip: string
  device: string
  _id: string
}

interface PaymentLog {
  date: string
  amount: number
  method: string
  transactionId: string
  status: string
  _id: string
}

interface BatchData {
  _id: string;
  batchId: string;
  programName: string;
}

interface UserData {
  _id: string
  userId: string
  phoneNumber: string
  email: string
  firstName: string
  lastName: string
  role: string
  paymentStatus: boolean
  activeStatus: boolean
  profileImage: {
    url: string
    cloudinaryId: string
  }
  batchId?: string
  department?: string
  rollNumber?: string
  semester?: number
  institution?: string
  fatherName?: string
  courseCreditScore?: number
  grade?: string
  profileComplete?: boolean
  consentStatus?: boolean
  openingStamp?: string
  createdAt?: string
  updatedAt?: string
  __v?: number
  address?: Address
  attendanceStats?: {
    present: number
    absent: number
    late: number
    halfDay: number
    percentage: number
  }
  lastLogin?: Array<{
    timestamp: string
    ip: string
    device: string
    _id: string
  }>
  paymentLogs?: Array<{
    date: string
    amount: number
    method: string
    transactionId: string
    status: string
    _id: string
  }>
}

interface ApiResponse {
  success: boolean
  data: {
    users: UserData[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
}

// Mock user data matching server structure
const mockUsers: UserData[] = [
  {
    _id: "686887389438da8712307e0c",
    userId: "USER1751680824636",
    phoneNumber: "6001330245",
    email: "banking@intellaris.co",
    firstName: "RIPUN",
    lastName: "BASUMATARY",
    department: "Computer Science Engineering",
    rollNumber: "242025029",
    semester: 8,
    institution: "The Assam Royal Global University",
    fatherName: "Palash Basumatary",
    paymentStatus: true,
    activeStatus: true,
    courseCreditScore: 0,
    grade: "",
    role: "user",
    profileComplete: true,
    consentStatus: true,
    openingStamp: "2025-07-05T02:00:24.637Z",
    profileImage: {
      url: "https://res.cloudinary.com/dojodcwxm/image/upload/v1751681003/user-profile/vpzolhymxu502rklyqrj.jpg",
      cloudinaryId: "user-profile/vpzolhymxu502rklyqrj"
    },
    address: {
      street: "Salbari (Udhiaguri), Baksa District, Assam, India, 781318",
      city: "Barpeta",
      state: "Assam",
      pincode: "781318"
    },
    attendanceStats: {
      present: 1,
      absent: 0,
      late: 0,
      halfDay: 0,
      percentage: 100
    },
    lastLogin: [
      {
        timestamp: "2025-07-05T02:01:13.317Z",
        ip: "152.59.149.52",
        device: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0",
        _id: "686887699438da8712307e17"
      }
    ],
    paymentLogs: [
      {
        date: "2025-07-05T02:11:27.899Z",
        amount: 10,
        method: "phonepe",
        transactionId: "ORDER_1751681463985_29ff42bb",
        status: "success",
        _id: "686889cf9438da8712307ea7"
      }
    ],
    createdAt: "2025-07-05T02:00:24.637Z",
    updatedAt: "2025-07-05T02:11:58.642Z",
    __v: 1,
    batchId: "6867fec69438da8712307ad1"
  }
]

type SortField = "firstName" | "email" | "role" | "activeStatus" | "paymentStatus" | "userId" | "batchId"
type SortOrder = "asc" | "desc"

interface UserModalProps {
  user?: UserData
  onClose: () => void
  onSave: (user: UserData) => void
}

const fadeInKeyframes = {
  from: { opacity: 0 },
  to: { opacity: 1 }
};

const zoomInKeyframes = {
  from: { transform: 'scale(0.95)', opacity: 0 },
  to: { transform: 'scale(1)', opacity: 1 }
};

function UserModal({ user, onClose, onSave }: UserModalProps) {
  const [formData, setFormData] = useState(user || mockUsers[0])
  const [isClosing, setIsClosing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => onClose(), 150)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return;
    
    setIsLoading(true)
    setError(null)

    try {
      const { tokens } = getStoredAuthData()
      if (!tokens?.accessToken) {
        throw new Error('No access token found')
      }

      // Prepare the data to send
      const dataToSend = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        batchId: formData.batchId || "",
        department: formData.department,
        rollNumber: formData.rollNumber,
        semester: formData.semester,
        institution: formData.institution,
        fatherName: formData.fatherName,
        address: formData.address,
        paymentStatus: formData.paymentStatus,
        activeStatus: formData.activeStatus,
        courseCreditScore: formData.courseCreditScore || 0,
        grade: formData.grade || "",
        role: formData.role
      }

      const response = await fetch(`${API_BASE_URL}/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update user')
      }

      if (data.success) {
        onSave(data.data.user)
        handleClose()
      } else {
        throw new Error('Failed to update user')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`fixed inset-0 bg-white flex items-center justify-center z-50 ${isClosing ? 'animate-[fadeOut_0.15s_ease-in]' : 'animate-[fadeIn_0.15s_ease-out]'}`}>
      <form onSubmit={handleSubmit} className={`bg-white p-8 w-full max-w-[90%] max-h-[85vh] overflow-y-auto shadow-[0_2px_4px_rgba(0,0,0,0.05),0_4px_8px_rgba(0,0,0,0.05),0_8px_16px_rgba(0,0,0,0.05)] ${isClosing ? 'animate-[zoomOut_0.15s_ease-in]' : 'animate-[zoomIn_0.15s_ease-out]'}`}>
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center space-x-6">
            <div className="relative w-24 h-24 overflow-hidden">
              {formData.profileImage?.url ? (
                <Image
                  src={formData.profileImage.url}
                  alt={`${formData.firstName} ${formData.lastName}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-3xl font-medium">
                  {formData.firstName[0]}{formData.lastName[0]}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Edit User</h2>
              <p className="text-gray-500 text-lg mt-1">{formData.userId}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="bg-gray-50 p-6">
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 text-gray-900 flex items-center">
              <User2 className="h-5 w-5 mr-2 text-gray-500" />
              Personal Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-gray-600 mb-1">First Name</label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-600 mb-1">Last Name</label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-600 mb-1">Father's Name</label>
                <Input
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-600 mb-1">Role</label>
                <Input
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-gray-50 p-6">
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 text-gray-900 flex items-center">
              <School className="h-5 w-5 mr-2 text-gray-500" />
              Academic Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-gray-600 mb-1">Institution</label>
                <Input
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-600 mb-1">Department</label>
                <Input
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-600 mb-1">Roll Number</label>
                <Input
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-600 mb-1">Semester</label>
                <Input
                  type="number"
                  min="1"
                  max="8"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-600 mb-1">Course Credit Score</label>
                <Input
                  type="number"
                  value={formData.courseCreditScore || 0}
                  onChange={(e) => setFormData({ ...formData, courseCreditScore: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-600 mb-1">Grade</label>
                <Input
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Address & Status */}
          <div className="bg-gray-50 p-6">
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 text-gray-900 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-gray-500" />
              Address & Status
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-gray-600 mb-1">Street</label>
                <Input
                  value={formData.address?.street}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, street: e.target.value }
                  })}
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-600 mb-1">City</label>
                <Input
                  value={formData.address?.city}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, city: e.target.value }
                  })}
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-600 mb-1">State</label>
                <Input
                  value={formData.address?.state}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, state: e.target.value }
                  })}
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-600 mb-1">Pincode</label>
                <Input
                  value={formData.address?.pincode}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, pincode: e.target.value }
                  })}
                />
              </div>
              <div className="flex items-center space-x-4 mt-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.activeStatus}
                    onChange={(e) => setFormData({ ...formData, activeStatus: e.target.checked })}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="font-semibold text-gray-600">Active Status</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.paymentStatus}
                    onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.checked })}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="font-semibold text-gray-600">Payment Status</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

function UserDetailsModal({ user, onClose }: { user: UserData; onClose: () => void }) {
  const [isClosing, setIsClosing] = useState(false)
  const [detailedUser, setDetailedUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const { tokens } = getStoredAuthData()
        
        if (!tokens?.accessToken) {
          throw new Error('No access token found')
        }

        const response = await fetch(`${API_BASE_URL}/users/${user._id}`, {
          headers: {
            'Authorization': `Bearer ${tokens.accessToken}`,
            'Content-Type': 'application/json'
          }
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.success === false ? 'Failed to fetch user details' : 'Network error')
        }

        if (data.success && data.data.user) {
          setDetailedUser(data.data.user)
        } else {
          throw new Error('Failed to fetch user details')
        }
      } catch (error) {
        console.error('Failed to fetch user details:', error)
        setError(error instanceof Error ? error.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserDetails()
  }, [user._id])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => onClose(), 150)
  }

  // Use detailedUser if available, otherwise fall back to passed user prop
  const displayUser = detailedUser || user

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="flex items-center space-x-4">
          <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
          <span className="text-lg text-gray-600">Loading user details...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">Error</h3>
          <p className="mt-2 text-sm text-gray-600">{error}</p>
          <Button variant="outline" onClick={handleClose} className="mt-4">
            Close
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`fixed inset-0 bg-white flex items-center justify-center z-50 ${isClosing ? 'animate-[fadeOut_0.15s_ease-in]' : 'animate-[fadeIn_0.15s_ease-out]'}`}>
      <div className={`bg-white p-8 w-full max-w-[90%] max-h-[85vh] overflow-y-auto shadow-[0_2px_4px_rgba(0,0,0,0.05),0_4px_8px_rgba(0,0,0,0.05),0_8px_16px_rgba(0,0,0,0.05)] ${isClosing ? 'animate-[zoomOut_0.15s_ease-in]' : 'animate-[zoomIn_0.15s_ease-out]'}`}>
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center space-x-6">
            <div className="relative w-24 h-24 overflow-hidden">
              {displayUser.profileImage?.url ? (
                <Image
                  src={displayUser.profileImage.url}
                  alt={`${displayUser.firstName} ${displayUser.lastName}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-3xl font-medium">
                  {displayUser.firstName[0]}{displayUser.lastName[0]}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{displayUser.firstName} {displayUser.lastName}</h2>
              <p className="text-gray-500 text-lg mt-1">{displayUser.userId}</p>
              <div className="flex items-center mt-2 space-x-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  displayUser.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"
                }`}>
                  {displayUser.role}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  displayUser.activeStatus ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}>
                  {displayUser.activeStatus ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={handleClose} className="text-gray-500">
            Close
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="bg-gray-50 p-6">
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 text-gray-900 flex items-center">
              <User2 className="h-5 w-5 mr-2 text-gray-500" />
              Personal Information
            </h3>
            <div className="space-y-4">
              <div className="text-gray-600">
                <span className="font-semibold">Father's Name: </span>
                <span>{displayUser.fatherName}</span>
              </div>
              <div className="text-gray-600">
                <span className="font-semibold">Email: </span>
                <span>{displayUser.email}</span>
              </div>
              <div className="text-gray-600">
                <span className="font-semibold">Phone: </span>
                <span>{displayUser.phoneNumber}</span>
              </div>
              <div className="text-gray-600">
                <span className="font-semibold">Address: </span>
                <span>{displayUser.address?.street}, {displayUser.address?.city}, {displayUser.address?.state} - {displayUser.address?.pincode}</span>
              </div>
              <div className="text-gray-600">
                <span className="font-semibold">Profile Complete: </span>
                <span>{displayUser.profileComplete ? "Yes" : "No"}</span>
              </div>
              <div className="text-gray-600">
                <span className="font-semibold">Consent Status: </span>
                <span>{displayUser.consentStatus ? "Provided" : "Not Provided"}</span>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-gray-50 p-6">
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 text-gray-900 flex items-center">
              <School className="h-5 w-5 mr-2 text-gray-500" />
              Academic Information
            </h3>
            <div className="space-y-4">
              <div className="text-gray-600">
                <span className="font-semibold">Institution: </span>
                <span>{displayUser.institution}</span>
              </div>
              <div className="text-gray-600">
                <span className="font-semibold">Department: </span>
                <span>{displayUser.department}</span>
              </div>
              <div className="text-gray-600">
                <span className="font-semibold">Semester: </span>
                <span>{displayUser.semester}</span>
              </div>
              <div className="text-gray-600">
                <span className="font-semibold">Roll Number: </span>
                <span>{displayUser.rollNumber}</span>
              </div>
              <div className="text-gray-600">
                <span className="font-semibold">Course Credit Score: </span>
                <span>{displayUser.courseCreditScore}</span>
              </div>
              <div className="text-gray-600">
                <span className="font-semibold">Grade: </span>
                <span>{displayUser.grade || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Attendance Stats */}
          <div className="bg-gray-50 p-6">
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 text-gray-900 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-gray-500" />
              Attendance Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-600">Present</span>
                <span>{displayUser.attendanceStats?.present}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-600">Absent</span>
                <span>{displayUser.attendanceStats?.absent}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-600">Late</span>
                <span>{displayUser.attendanceStats?.late}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-600">Half Day</span>
                <span>{displayUser.attendanceStats?.halfDay}</span>
              </div>
              <div className="flex items-center justify-between text-green-600">
                <span className="font-semibold">Attendance Percentage</span>
                <span className="font-bold">{displayUser.attendanceStats?.percentage}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment History */}
        {(displayUser.paymentLogs?.length ?? 0) > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 text-gray-900 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-gray-500" />
              Recent Payments
            </h3>
            <div className="bg-gray-50 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Method</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Transaction ID</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayUser.paymentLogs?.map((payment) => (
                    <tr key={payment._id} className="border-t border-gray-200">
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(payment.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        ₹{payment.amount}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                        {payment.method}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {payment.transactionId}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === "success" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Last Login History */}
        {(displayUser.lastLogin?.length ?? 0) > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 text-gray-900 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-gray-500" />
              Last Login History
            </h3>
            <div className="bg-gray-50 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Timestamp</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">IP Address</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Device</th>
                  </tr>
                </thead>
                <tbody>
                  {displayUser.lastLogin?.map((login) => (
                    <tr key={login._id} className="border-t border-gray-200">
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(login.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {login.ip}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {login.device}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function BatchAssignmentModal({ user, onClose }: { user: UserData; onClose: () => void }) {
  const [isClosing, setIsClosing] = useState(false)
  const [batches, setBatches] = useState<BatchData[]>([])
  const [selectedBatch, setSelectedBatch] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAssigning, setIsAssigning] = useState(false)

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const { tokens } = getStoredAuthData()
        
        if (!tokens?.accessToken) {
          throw new Error('No access token found')
        }

        const response = await fetch(`${API_BASE_URL}/batches?status=running&year=2025`, {
          headers: {
            'Authorization': `Bearer ${tokens.accessToken}`,
            'Content-Type': 'application/json'
          }
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch batches')
        }

        if (data.success) {
          setBatches(data.data)
        } else {
          throw new Error('Failed to fetch batches')
        }
      } catch (error) {
        console.error('Failed to fetch batches:', error)
        setError(error instanceof Error ? error.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBatches()
  }, [])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => onClose(), 150)
  }

  const handleAssign = async () => {
    if (!selectedBatch) {
      setError('Please select a batch')
      return
    }

    try {
      setIsAssigning(true)
      setError(null)

      const { tokens } = getStoredAuthData()
      
      if (!tokens?.accessToken) {
        throw new Error('No access token found')
      }

      const response = await fetch(`${API_BASE_URL}/batches/${selectedBatch}/students/${user._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.success === false ? data.message || 'Failed to assign batch' : 'Network error')
      }

      if (data.success) {
        handleClose()
        // Trigger a refresh of the users list
        window.location.reload()
      } else {
        throw new Error('Failed to assign batch')
      }
    } catch (error) {
      console.error('Failed to assign batch:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsAssigning(false)
    }
  }

  return (
    <div className={`fixed inset-0 bg-white flex items-center justify-center z-50 ${isClosing ? 'animate-[fadeOut_0.15s_ease-in]' : 'animate-[fadeIn_0.15s_ease-out]'}`}>
      <div className={`bg-white p-8 w-full max-w-md shadow-[0_2px_4px_rgba(0,0,0,0.05),0_4px_8px_rgba(0,0,0,0.05),0_8px_16px_rgba(0,0,0,0.05)] ${isClosing ? 'animate-[zoomOut_0.15s_ease-in]' : 'animate-[zoomIn_0.15s_ease-out]'}`}>
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Assign Batch</h3>
          <p className="mt-2 text-sm text-gray-600">
            Assign {user.firstName} {user.lastName} to a batch
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="h-6 w-6 text-blue-600 animate-spin" />
            <span className="ml-2 text-gray-600">Loading batches...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Batch
              </label>
              <Select
                value={selectedBatch}
                onValueChange={setSelectedBatch}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((batch) => (
                    <SelectItem key={batch._id} value={batch._id}>
                      {batch.programName} ({batch.batchId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isAssigning}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssign}
                disabled={isAssigning || !selectedBatch}
              >
                {isAssigning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  'Assign Batch'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DeleteConfirmation({ onConfirm, onCancel, isDeleting }: { 
  onConfirm: () => void
  onCancel: () => void
  isDeleting: boolean 
}) {
  const [isClosing, setIsClosing] = useState(false)

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => onCancel(), 150)
  }

  return (
    <div className={`fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 ${isClosing ? 'animate-[fadeOut_0.15s_ease-in]' : 'animate-[fadeIn_0.15s_ease-out]'}`}>
      <div className={`bg-white p-8 w-full max-w-md shadow-[0_2px_4px_rgba(0,0,0,0.05),0_4px_8px_rgba(0,0,0,0.05),0_8px_16px_rgba(0,0,0,0.05)] rounded-lg ${isClosing ? 'animate-[zoomOut_0.15s_ease-in]' : 'animate-[zoomIn_0.15s_ease-out]'}`}>
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">Delete User</h3>
          <p className="mt-2 text-sm text-gray-600">
            Are you sure you want to delete this user? This action cannot be undone.
          </p>
          <div className="mt-6 flex justify-center space-x-4">
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Users() {
  const [users, setUsers] = useState<UserData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showBatchAssignModal, setShowBatchAssignModal] = useState(false)
  const [userToAssign, setUserToAssign] = useState<UserData | null>(null)
  const [userToView, setUserToView] = useState<UserData | null>(null)
  const [showAdmins, setShowAdmins] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortConfig, setSortConfig] = useState<{ field: SortField; order: SortOrder }>({
    field: "firstName",
    order: "asc",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Get the stored auth data using the utility function
        const { tokens } = getStoredAuthData()
        
        if (!tokens?.accessToken) {
          throw new Error('No access token found')
        }

        const response = await fetch(`${API_BASE_URL}/users`, {
          headers: {
            'Authorization': `Bearer ${tokens.accessToken}`,
            'Content-Type': 'application/json'
          }
        })

        const data: ApiResponse = await response.json()

        if (!response.ok) {
          throw new Error(data.success === false ? 'Failed to fetch users' : 'Network error')
        }

        if (data.success && data.data.users) {
          setUsers(data.data.users)
        } else {
          throw new Error('Failed to fetch users')
        }
      } catch (error) {
        console.error('Failed to fetch users:', error)
        setError(error instanceof Error ? error.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users]
    
    // Filter based on search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(user => 
        user.firstName?.toLowerCase().includes(query) ||
        user.lastName?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.phoneNumber?.includes(query) ||
        user._id?.includes(query) ||
        user.userId?.toLowerCase().includes(query)
      )
    }
    
    // Filter out admins if showAdmins is false
    if (!showAdmins) {
      result = result.filter(user => 
        !user.userId.includes('ADMIN') && !user.userId.includes('SADMIN')
      )
    }
    
    // Sort the filtered results
    result.sort((a, b) => {
      const aValue = a[sortConfig.field]
      const bValue = b[sortConfig.field]
      
      // Handle undefined values
      if (aValue === undefined && bValue === undefined) return 0
      if (aValue === undefined) return 1
      if (bValue === undefined) return -1
      
      if (aValue < bValue) return sortConfig.order === "asc" ? -1 : 1
      if (aValue > bValue) return sortConfig.order === "asc" ? 1 : -1
      return 0
    })
    
    return result
  }, [users, sortConfig, showAdmins, searchQuery])

  // Update pagination to use filtered results
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage)
  const paginatedUsers = filteredAndSortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSort = (field: SortField) => {
    setSortConfig(current => ({
      field,
      order: current.field === field && current.order === "asc" ? "desc" : "asc",
    }))
  }

  const handleSaveUser = (userData: UserData) => {
    if (selectedUser) {
      setUsers(users.map(user => (user._id === selectedUser ? userData : user)))
    }
    setShowUserModal(false)
    setSelectedUser(null)
  }

  // Calculate user statistics
  const userStats = useMemo(() => {
    const stats = {
      totalUsers: users.length,
      regularUsers: 0,
      adminUsers: 0,
      superAdminUsers: 0
    }

    users.forEach(user => {
      if (user.userId.includes('SADMIN')) {
        stats.superAdminUsers++
      } else if (user.userId.includes('ADMIN')) {
        stats.adminUsers++
      } else {
        stats.regularUsers++
      }
    })

    return stats
  }, [users])

  // Add styles to the head
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      @keyframes zoomIn {
        from { 
          transform: scale(0.95);
          opacity: 0;
        }
        to { 
          transform: scale(1);
          opacity: 1;
        }
      }
      @keyframes zoomOut {
        from { 
          transform: scale(1);
          opacity: 1;
        }
        to { 
          transform: scale(0.95);
          opacity: 0;
        }
      }
      @keyframes blink {
        0% { opacity: 1; }
        50% { opacity: 0.4; }
        100% { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setIsDeleting(true)
      setDeleteError(null)

      const { tokens } = getStoredAuthData()
      if (!tokens?.accessToken) {
        throw new Error('No access token found')
      }

      const response = await fetch(`${API_BASE_URL}/users/${userToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete user')
      }

      if (data.success) {
        setUsers(users.filter(user => user._id !== userToDelete))
        setShowDeleteConfirm(false)
        setUserToDelete(null)
      } else {
        throw new Error('Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      setDeleteError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Stats Section */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
          <div className="text-sm font-medium text-gray-500">Total Users</div>
          <div className="mt-1">
            <span className="text-2xl font-semibold text-gray-900">{userStats.totalUsers}</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
          <div className="text-sm font-medium text-gray-500">Regular Users</div>
          <div className="mt-1">
            <span className="text-2xl font-semibold text-blue-600">{userStats.regularUsers}</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
          <div className="text-sm font-medium text-gray-500">Administrators</div>
          <div className="mt-1">
            <span className="text-2xl font-semibold text-orange-600">{userStats.adminUsers}</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
          <div className="text-sm font-medium text-gray-500">Super Administrators</div>
          <div className="mt-1">
            <span className="text-2xl font-semibold text-purple-600">{userStats.superAdminUsers}</span>
          </div>
        </div>
      </div>

      {/* Header with Filter */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <div className="flex items-center space-x-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, email, phone or user id"
                className="pl-10 h-10 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 w-80"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showAdmins"
                checked={showAdmins}
                onChange={(e) => {
                  setShowAdmins(e.target.checked);
                  setCurrentPage(1); // Reset to page 1 when toggling admin visibility
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="showAdmins" className="text-sm text-gray-600">
                Show Administrators
              </label>
            </div>
          </div>
        </div>
        <p className="text-gray-600">Manage your team members and their account permissions here</p>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <Card className="rounded-2xl border-0 shadow-sm bg-white">
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
              <span className="ml-3 text-lg text-gray-600">Loading users...</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* User List */
        <Card className="rounded-2xl border-0 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-6 font-medium text-gray-600">
                      <button
                        className="flex items-center space-x-1"
                        onClick={() => handleSort("firstName")}
                      >
                        <span>User</span>
                        {sortConfig.field === "firstName" && (
                          sortConfig.order === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">Contact</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">
                      <button
                        className="flex items-center space-x-1"
                        onClick={() => handleSort("role")}
                      >
                        <span>Role</span>
                        {sortConfig.field === "role" && (
                          sortConfig.order === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">
                      <button
                        className="flex items-center space-x-1"
                        onClick={() => handleSort("activeStatus")}
                      >
                        <span>Status</span>
                        {sortConfig.field === "activeStatus" && (
                          sortConfig.order === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">
                      <button
                        className="flex items-center space-x-1"
                        onClick={() => handleSort("userId")}
                      >
                        <span>User ID</span>
                        {sortConfig.field === "userId" && (
                          sortConfig.order === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">
                      <button
                        className="flex items-center space-x-1"
                        onClick={() => handleSort("batchId")}
                      >
                        <span>Batch</span>
                        {sortConfig.field === "batchId" && (
                          sortConfig.order === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-right py-4 px-6 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user) => (
                      <tr
                        key={user._id}
                        className={`border-b border-gray-200 hover:bg-gray-50 ${
                          selectedUser === user._id ? "bg-purple-50" : ""
                        }`}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-4">
                            <div className="relative w-14 h-14 rounded-lg overflow-hidden">
                              {user.profileImage?.url ? (
                                <Image
                                  src={user.profileImage.url}
                                  alt={`${user.firstName} ${user.lastName}`}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xl font-medium">
                                  {user.firstName?.[0] || 'N'}{user.lastName?.[0] || 'A'}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {user.firstName || 'N/A'} {user.lastName || ''}
                              </div>
                              <div className="inline-flex items-baseline">
                                <span className="text-sm text-gray-500">{user.email || 'N/A'}</span>
                                {user.activeStatus && (
                                  <span 
                                    className="ml-2 w-1.5 h-1.5 rounded-full bg-green-500 relative animate-[blink_2s_ease-in-out_infinite]" 
                                    style={{ top: '-0.5px' }}
                                  ></span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{user.phoneNumber || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"
                          }`}>
                            {user.role || 'user'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.paymentStatus ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {user.paymentStatus ? "Paid" : "Pending"}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {user.userId.includes('ADMIN') || user.userId.includes('SADMIN') ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Hidden
                            </span>
                          ) : (
                            <span className="text-sm text-gray-600">
                              {user.userId || 'N/A'}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          {user.userId.includes('ADMIN') || user.userId.includes('SADMIN') ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              Executive
                            </span>
                          ) : user.batchId ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Assigned
                            </span>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                              onClick={() => {
                                setUserToAssign(user)
                                setShowBatchAssignModal(true)
                              }}
                            >
                              Assign
                            </Button>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-500 hover:text-blue-600"
                              onClick={() => {
                                setUserToView(user)
                                setShowDetailsModal(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-500 hover:text-gray-700"
                              onClick={() => {
                                setSelectedUser(user._id)
                                setShowUserModal(true)
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-500 hover:text-red-600"
                              onClick={() => {
                                setUserToDelete(user._id)
                                setShowDeleteConfirm(true)
                                setDeleteError(null)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 py-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      {showUserModal && selectedUser && (
        <UserModal
          user={users.find(u => u._id === selectedUser)}
          onClose={() => {
            setShowUserModal(false)
            setSelectedUser(null)
          }}
          onSave={handleSaveUser}
        />
      )}

      {showDetailsModal && userToView && (
        <UserDetailsModal
          user={userToView}
          onClose={() => {
            setShowDetailsModal(false)
            setUserToView(null)
          }}
        />
      )}

      {showBatchAssignModal && userToAssign && (
        <BatchAssignmentModal
          user={userToAssign}
          onClose={() => {
            setShowBatchAssignModal(false)
            setUserToAssign(null)
          }}
        />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmation
          onConfirm={handleDeleteUser}
          onCancel={() => {
            setShowDeleteConfirm(false)
            setUserToDelete(null)
            setDeleteError(null)
          }}
          isDeleting={isDeleting}
        />
      )}
    </div>
  )
} 