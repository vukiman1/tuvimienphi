export enum PaymentStatus {
  Credited = 'credited',
  Unmatched = 'unmatched',
}

export enum UnmatchedReason {
  NoCode = 'no_code',
  UnknownCode = 'unknown_code',
  AmountTooLow = 'amount_too_low',
}
