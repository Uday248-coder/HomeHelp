import { IIdentityProvider } from './providers/identity/IIdentityProvider';
import { ILicenseProvider } from './providers/license/ILicenseProvider';
import { IDigiLockerProvider } from './providers/digilocker/IDigiLockerProvider';
import { MockIdentityProvider } from './providers/identity/MockIdentityProvider';
import { SurepassIdentityProvider } from './providers/identity/SurepassIdentityProvider';
import { MockLicenseProvider } from './providers/license/MockLicenseProvider';
import { SurepassLicenseProvider } from './providers/license/SurepassLicenseProvider';
import { MockDigiLockerProvider } from './providers/digilocker/MockDigiLockerProvider';
import { SetuDigiLockerProvider } from './providers/digilocker/SetuDigiLockerProvider';

export type KycProviderMode = 'mock' | 'sandbox' | 'production';

export function getKycProviderMode(): KycProviderMode {
  return (process.env.KYC_PROVIDER_MODE as KycProviderMode) || 'mock';
}

export function getIdentityProvider(): IIdentityProvider {
  if (process.env.KYC_PROVIDER_MODE === 'production' || process.env.KYC_PROVIDER_MODE === 'sandbox') {
    if (process.env.IDENTITY_PROVIDER === 'surepass') {
      return new SurepassIdentityProvider();
    }
  }
  return new MockIdentityProvider();
}

export function getLicenseProvider(): ILicenseProvider {
  if (process.env.KYC_PROVIDER_MODE === 'production' || process.env.KYC_PROVIDER_MODE === 'sandbox') {
    if (process.env.DL_PROVIDER === 'surepass') {
      return new SurepassLicenseProvider();
    }
  }
  return new MockLicenseProvider();
}

export function getDigiLockerProvider(): IDigiLockerProvider {
  if (process.env.KYC_PROVIDER_MODE === 'production' || process.env.KYC_PROVIDER_MODE === 'sandbox') {
    if (process.env.DIGILOCKER_PROVIDER === 'setu') {
      return new SetuDigiLockerProvider();
    }
  }
  return new MockDigiLockerProvider();
}
