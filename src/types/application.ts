export interface Application {
  _id: string
  fullName: string
  age: number
  address: string
  phoneNumber: string
  portraitPhoto: string
  paymentStatus: string
  status: string
  totalVoteAmount: number
  votes: {
    count: number
    lastVoteDate: string
  }
  createdAt: string
  updatedAt: string
  rejectionReason: string | null
}