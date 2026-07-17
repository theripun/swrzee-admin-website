import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Search, Calendar, Clock, Users as UsersIcon, Loader2, Mail, Phone, School, GraduationCap, User, Trash2, UserMinus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { getStoredAuthData, API_BASE_URL } from "@/lib/utils"
import Image from "next/image"

interface Service {
  _id: string
  serviceName: string
  description: string
}

interface User {
  _id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  department: string
  rollNumber: string
  semester: number
  institution: string
  grade: string
  profileImage: {
    url: string
    cloudinaryId: string
  }
  attendanceStats: {
    present: number
    absent: number
    late: number
    halfDay: number
    percentage: number
  }
  paymentStatus: boolean
  activeStatus: boolean
}

interface Batch {
  _id: string
  batchId: string
  programName: string
  courseCredit: number
  services: Service[]
  duration: string
  startDate: string
  endDate: string
  status: string
  year: number
  totalFee: number
  attendancePolicy: {
    minPercentage: number
    graceDays: number
  }
  classTiming: {
    startTime: string
    endTime: string
    lateThreshold: number
  }
  students: string[]
}

interface CreateBatchData {
  batchId: string
  programName: string
  courseCredit: number
  services: string[]
  duration: string
  startDate: string
  endDate: string
  year: number
  totalFee: number | ""
  attendancePolicy: {
    minPercentage: number
    graceDays: number
  }
}

function CreateBatchModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableServices, setAvailableServices] = useState<Service[]>([])
  const [formData, setFormData] = useState<CreateBatchData>({
    batchId: "",
    programName: "",
    courseCredit: 2,
    services: [],
    duration: "3 months",
    startDate: "",
    endDate: "",
    year: new Date().getFullYear(),
    totalFee: "" as unknown as number,
    attendancePolicy: {
      minPercentage: 85,
      graceDays: 3
    }
  })

  useEffect(() => {
    // Fetch available services
    const fetchServices = async () => {
      try {
        const { tokens } = getStoredAuthData()
        if (!tokens?.accessToken) {
          throw new Error('No access token found')
        }

        const response = await fetch(`${API_BASE_URL}/services?category=Course&isActive=true`, {
          headers: {
            'Authorization': `Bearer ${tokens.accessToken}`,
          }
        })

        const data = await response.json()
        if (data.success) {
          setAvailableServices(data.data)
        }
      } catch (error) {
        console.error('Error fetching services:', error)
      }
    }

    fetchServices()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { tokens } = getStoredAuthData()
      if (!tokens?.accessToken) {
        throw new Error('No access token found')
      }

      const dataToSend = {
        ...formData,
        totalFee: Number(formData.totalFee)
      }

      const response = await fetch(`${API_BASE_URL}/batches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
        body: JSON.stringify(dataToSend),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create batch')
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-4">Create New Batch</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Batch ID</label>
              <Input
                value={formData.batchId}
                onChange={(e) => setFormData(prev => ({ ...prev, batchId: e.target.value }))}
                required
                placeholder="BATCH2025-04"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Program Name</label>
              <Input
                value={formData.programName}
                onChange={(e) => setFormData(prev => ({ ...prev, programName: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Course Credit</label>
              <Input
                type="number"
                value={formData.courseCredit}
                onChange={(e) => setFormData(prev => ({ ...prev, courseCredit: Number(e.target.value) }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Fee</label>
              <Input
                type="number"
                value={formData.totalFee || ""}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  totalFee: e.target.value ? Number(e.target.value) : "" as unknown as number 
                }))}
                required
                placeholder="Enter total fee"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Min. Attendance %</label>
              <Input
                type="number"
                value={formData.attendancePolicy.minPercentage}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  attendancePolicy: {
                    ...prev.attendancePolicy,
                    minPercentage: Number(e.target.value)
                  }
                }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Grace Days</label>
              <Input
                type="number"
                value={formData.attendancePolicy.graceDays}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  attendancePolicy: {
                    ...prev.attendancePolicy,
                    graceDays: Number(e.target.value)
                  }
                }))}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Services</label>
            <select
              className="w-full rounded-md border border-gray-300 p-2"
              value={formData.services[0] || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, services: [e.target.value] }))}
              required
            >
              <option value="">Select a service</option>
              {availableServices.map(service => (
                <option key={service._id} value={service._id}>
                  {service.serviceName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Batch'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message 
}: { 
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>Confirm</Button>
        </div>
      </div>
    </div>
  );
}

function ViewStudentsModal({ batch, onClose, onBatchUpdate }: { 
  batch: Batch
  onClose: () => void
  onBatchUpdate: () => void 
}) {
  const [students, setStudents] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [removingStudent, setRemovingStudent] = useState<string | null>(null)
  const [showConfirmRemove, setShowConfirmRemove] = useState(false)

  useEffect(() => {
    fetchStudents()
  }, [batch.students])

  const fetchStudents = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { tokens } = getStoredAuthData()
      if (!tokens?.accessToken) {
        throw new Error('No access token found')
      }

      const studentPromises = batch.students.map(studentId =>
        fetch(`${API_BASE_URL}/users/${studentId}`, {
          headers: {
            'Authorization': `Bearer ${tokens.accessToken}`,
          }
        }).then(res => res.json())
      )

      const results = await Promise.all(studentPromises)
      const studentData = results.map(result => result.data.user)
      setStudents(studentData)
    } catch (error) {
      console.error('Error fetching students:', error)
      setError('Failed to fetch student details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveStudent = async () => {
    if (!removingStudent) return;

    try {
      const { tokens } = getStoredAuthData()
      if (!tokens?.accessToken) {
        throw new Error('No access token found')
      }

      const response = await fetch(`${API_BASE_URL}/batches/${batch._id}/students/${removingStudent}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
        }
      })

      if (!response.ok) {
        throw new Error('Failed to remove student')
      }

      // Update local state and parent component
      setStudents(students.filter(s => s._id !== removingStudent))
      onBatchUpdate()
      setShowConfirmRemove(false)
      setRemovingStudent(null)
    } catch (error) {
      console.error('Error removing student:', error)
      setError('Failed to remove student')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Students</h2>
            <p className="text-gray-500">Batch: {batch.batchId}</p>
          </div>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center flex-1">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 -mx-6 px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {students.map((student) => (
                <Card key={student._id} className="p-4">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative h-16 w-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                      {student.profileImage?.url ? (
                        <Image
                          src={student.profileImage.url}
                          alt={`${student.firstName} ${student.lastName}`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <User className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-lg">
                            {student.firstName} {student.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">{student.userId}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            student.activeStatus 
                              ? 'bg-green-50 text-green-700' 
                              : 'bg-red-50 text-red-700'
                          }`}>
                            {student.activeStatus ? 'Active' : 'Inactive'}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setRemovingStudent(student._id)
                              setShowConfirmRemove(true)
                            }}
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{student.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{student.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <School className="h-4 w-4 text-gray-400" />
                      <span>{student.institution}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-gray-400" />
                      <span>{student.department} - Semester {student.semester}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Roll Number</p>
                        <p className="font-medium">{student.rollNumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Grade</p>
                        <p className="font-medium">{student.grade}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm font-medium mb-2">Attendance Stats</p>
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div className="text-center p-2 bg-green-50 rounded">
                        <p className="text-green-700 font-medium">{student.attendanceStats.present}</p>
                        <p className="text-gray-500">Present</p>
                      </div>
                      <div className="text-center p-2 bg-red-50 rounded">
                        <p className="text-red-700 font-medium">{student.attendanceStats.absent}</p>
                        <p className="text-gray-500">Absent</p>
                      </div>
                      <div className="text-center p-2 bg-yellow-50 rounded">
                        <p className="text-yellow-700 font-medium">{student.attendanceStats.late}</p>
                        <p className="text-gray-500">Late</p>
                      </div>
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <p className="text-blue-700 font-medium">{student.attendanceStats.percentage}%</p>
                        <p className="text-gray-500">Total</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showConfirmRemove}
        onClose={() => {
          setShowConfirmRemove(false)
          setRemovingStudent(null)
        }}
        onConfirm={handleRemoveStudent}
        title="Remove Student"
        message="Are you sure you want to remove this student from the batch? This action cannot be undone."
      />
    </div>
  )
}

export default function Batches() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [deletingBatch, setDeletingBatch] = useState<Batch | null>(null)

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
        }
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch batches')
      }

      if (data.success) {
        setBatches(data.data)
      }
    } catch (error) {
      console.error('Error fetching batches:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBatches()
  }, [])

  const filteredBatches = batches.filter(batch =>
    batch.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.programName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Calculate the difference in months
    const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                  (end.getMonth() - start.getMonth());
    
    // Calculate remaining days
    const remainingDays = end.getDate() - start.getDate();
    
    // Adjust months based on remaining days
    const adjustedMonths = remainingDays > 0 ? months + 1 : months;
    
    // Format the duration string
    if (adjustedMonths === 0) {
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return `${days} days`;
    } else if (adjustedMonths === 1) {
      return '1 month';
    } else {
      return `${adjustedMonths} months`;
    }
  };

  const handleDeleteBatch = async () => {
    if (!deletingBatch) return;

    try {
      const { tokens } = getStoredAuthData()
      if (!tokens?.accessToken) {
        throw new Error('No access token found')
      }

      const response = await fetch(`${API_BASE_URL}/batches/${deletingBatch._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete batch')
      }

      setBatches(batches.filter(b => b._id !== deletingBatch._id))
      setShowConfirmDelete(false)
      setDeletingBatch(null)
    } catch (error) {
      console.error('Error deleting batch:', error)
      setError('Failed to delete batch')
    }
  }

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Batches</h1>
        <p className="text-gray-500">Manage and monitor your active batches</p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search batches..."
            className="pl-10 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white ml-4"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Batch
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="space-y-6">
          {filteredBatches.map((batch) => (
            <Card key={batch._id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="py-8 px-6">
                <div className="flex items-start justify-between mb-6 px-4">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-medium text-gray-900">{batch.batchId}</h3>
                      <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                        {batch.status}
                      </span>
                    </div>
                    <p className="text-sm text-blue-600 font-medium">
                      {batch.programName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={`text-blue-600 border-blue-200 ${
                        batch.students.length > 0 
                          ? 'hover:border-blue-300 hover:bg-blue-50' 
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                      onClick={() => batch.students.length > 0 && setSelectedBatch(batch)}
                      disabled={batch.students.length === 0}
                    >
                      <UsersIcon className="h-4 w-4 mr-2" />
                      {batch.students.length === 0 ? 'No Students' : `View Students (${batch.students.length})`}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        setDeletingBatch(batch)
                        setShowConfirmDelete(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-8 mt-8 ml-4">
                  <div className="flex items-center gap-4">
                    <Calendar className="h-6 w-6 text-blue-500" />
                    <div>
                      <p className="text-gray-500 text-sm">Duration</p>
                      <p className="font-medium mt-1">
                        {calculateDuration(batch.startDate, batch.endDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Clock className="h-6 w-6 text-blue-500" />
                    <div>
                      <p className="text-gray-500 text-sm">Timing</p>
                      <p className="font-medium mt-1">{batch.classTiming.startTime} - {batch.classTiming.endTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <UsersIcon className="h-6 w-6 text-blue-500" />
                    <div>
                      <p className="text-gray-500 text-sm">Total Fee</p>
                      <p className="font-medium mt-1">₹{batch.totalFee}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 divide-x divide-gray-100 mt-8 pt-8 border-t border-gray-100">
                  <div className="px-4">
                    <p className="font-medium text-gray-900 mb-4">Schedule</p>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Start Date</span>
                        <span className="font-medium">{formatDate(batch.startDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">End Date</span>
                        <span className="font-medium">{formatDate(batch.endDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-4">
                    <p className="font-medium text-gray-900 mb-4">Attendance Policy</p>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Min. Required</span>
                        <span className="font-medium">{batch.attendancePolicy.minPercentage}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Grace Period</span>
                        <span className="font-medium">{batch.attendancePolicy.graceDays} days</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-4">
                    <p className="font-medium text-gray-900 mb-4">Class Rules</p>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Late Threshold</span>
                        <span className="font-medium">{batch.classTiming.lateThreshold} mins</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Services</span>
                        <span className="font-medium">{batch.services.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateBatchModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchBatches()
            setShowCreateModal(false)
          }}
        />
      )}

      {selectedBatch && (
        <ViewStudentsModal
          batch={selectedBatch}
          onClose={() => setSelectedBatch(null)}
          onBatchUpdate={fetchBatches}
        />
      )}

      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => {
          setShowConfirmDelete(false)
          setDeletingBatch(null)
        }}
        onConfirm={handleDeleteBatch}
        title="Delete Batch"
        message="Are you sure you want to delete this batch? This action cannot be undone."
      />
    </div>
  )
} 