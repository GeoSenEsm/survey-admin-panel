import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { finalize, Observable, switchMap } from 'rxjs';
import {
  SENSOR_PROFILE_SERVICE_TOKEN,
  START_SURVEY_SERVICE_TOKEN,
} from '../../../../../core/services/injection-tokens';
import {
  parseAndFormatProfileJson,
  summarizeProfile,
} from '../../../../../core/utils/sensor-profile-json';
import { isSelectableSensorTypeCode } from '../../../../../core/utils/sensor-type-filters';
import {
  collectServiceUuids,
  disconnectTestDevice,
  isWebBluetoothSupported,
  LiveTestStep,
  requestTestDevice,
  runLiveTest,
  WebBluetoothDevice,
} from '../../../../../core/utils/web-bluetooth-tester';
import { SensorProfileService } from '../../../../../domain/external_services/sensor-profile.service';
import { StartSurveyService } from '../../../../../domain/external_services/start-survey.service';
import {
  GattSequenceProfileSpecification,
  SensorIntegrationMode,
  SensorProfileDraftRequest,
  SensorProfileGoldenVectorResult,
  SensorProfileRevision,
  SensorProfileSensorType,
  SensorProfileValidationIssue,
  SensorProfileValidationResult,
} from '../../../../../domain/models/sensor-profile';

const SENSOR_TYPE_CODE_PATTERN = /^[a-z][a-z0-9_]*$/;

@Component({
  selector: 'app-sensor-profiles',
  templateUrl: './sensor-profiles.component.html',
  styleUrl: './sensor-profiles.component.scss',
})
export class SensorProfilesComponent implements OnInit, OnDestroy {
  readonly integrationModes: SensorIntegrationMode[] = [
    'profile',
    'native',
  ];

  sensorTypes: SensorProfileSensorType[] = [];
  revisions: SensorProfileRevision[] = [];
  selectedTypeId = '';
  selectedRevision?: SensorProfileRevision;
  profileJson = '{}';
  profileSyntaxError = '';
  profileValidation?: SensorProfileValidationResult;
  isBusy = false;
  newCode = '';
  newName = '';
  newIntegrationMode: SensorIntegrationMode = 'profile';
  newAdapterKey = '';
  minimumEngineVersion = '1.0.0';
  supportedAdapterKeys: string[] = [];
  sensorDataSetupLocked = false;

  readonly webBluetoothSupported = isWebBluetoothSupported();
  liveTestBusy = false;
  liveTestDeviceName = '';
  liveTestSteps: LiveTestStep[] = [];
  liveTestError = '';
  private liveTestDevice?: WebBluetoothDevice;

  constructor(
    @Inject(SENSOR_PROFILE_SERVICE_TOKEN)
    private readonly service: SensorProfileService,
    @Inject(START_SURVEY_SERVICE_TOKEN)
    private readonly startSurveyService: StartSurveyService,
    private readonly snackbar: MatSnackBar,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadSensorTypes();
    this.loadCapabilities();
    this.startSurveyService.getState().subscribe({
      next: (state) => (this.sensorDataSetupLocked = state === 'published'),
      error: () => (this.sensorDataSetupLocked = false),
    });
  }

  ngOnDestroy(): void {
    this.resetLiveTest();
  }

  /** Opens Chrome/Edge's native device picker, then runs the draft's write/delay/acquire steps
   * against whatever the user picks and shows exactly what came back — real bytes, real decoded
   * values — without touching a phone or publishing anything. */
  startLiveTest(): void {
    const parsed = parseAndFormatProfileJson(this.profileJson);
    if (!parsed.value || this.isAdvertisementProfile) {
      return;
    }
    const spec = parsed.value as GattSequenceProfileSpecification;
    this.liveTestBusy = true;
    this.liveTestError = '';
    this.liveTestSteps = [];
    requestTestDevice(collectServiceUuids(spec))
      .then((device) => {
        this.liveTestDevice = device;
        this.liveTestDeviceName = device.name || 'Unnamed device';
        return runLiveTest(device, spec);
      })
      .then((steps) => (this.liveTestSteps = steps))
      .catch((error) => {
        // NotFoundError is what the picker throws when the user closes it without choosing a
        // device — routine, not a failure worth showing as an error banner.
        if (error instanceof Error && error.name !== 'NotFoundError') {
          this.liveTestError = error.message;
        }
      })
      .finally(() => (this.liveTestBusy = false));
  }

  disconnectLiveTest(): void {
    this.resetLiveTest();
  }

  loadCapabilities(): void {
    this.service.getCapabilities().subscribe({
      next: (capabilities) => {
        this.supportedAdapterKeys = capabilities.supportedAdapterKeys;
      },
      error: () => this.showError('sensorProfiles.capabilitiesLoadError'),
    });
  }

  loadSensorTypes(): void {
    this.service.listSensorTypes().subscribe({
      next: (types) => {
        this.sensorTypes = types.filter((type) => isSelectableSensorTypeCode(type.code));
        if (!this.sensorTypes.some((type) => type.id === this.selectedTypeId)) {
          this.selectedTypeId = '';
        }
        if (!this.selectedTypeId && this.sensorTypes.length) {
          this.selectType(this.sensorTypes[0].id);
        }
      },
      error: () => this.showError('sensorProfiles.loadError'),
    });
  }

  selectType(typeId: string): void {
    this.selectedTypeId = typeId;
    this.selectedRevision = undefined;
    this.profileValidation = undefined;
    this.profileJson = '{}';
    this.resetLiveTest();
    if (typeId) {
      this.loadRevisions();
    } else {
      this.revisions = [];
    }
  }

  get selectedType(): SensorProfileSensorType | undefined {
    return this.sensorTypes.find((t) => t.id === this.selectedTypeId);
  }

  get profileSummary(): ReturnType<typeof summarizeProfile> | undefined {
    const parsed = parseAndFormatProfileJson(this.profileJson);
    return parsed.value ? summarizeProfile(parsed.value) : undefined;
  }

  get validationErrors(): SensorProfileValidationIssue[] {
    return this.profileValidation?.errors ?? [];
  }

  get goldenVectorResults(): SensorProfileGoldenVectorResult[] {
    return this.profileValidation?.goldenVectors ?? [];
  }

  /** Live device testing only works for GATT profiles: Web Bluetooth can connect and read a
   * named characteristic, but — unlike a native/mobile BLE stack — it cannot passively scan raw
   * advertisement payloads, so `ble_advertisement`/MiBeacon profiles can't be exercised this way. */
  get isAdvertisementProfile(): boolean {
    return this.profileSummary?.transport === 'ble_advertisement';
  }

  get canLiveTest(): boolean {
    return (
      this.webBluetoothSupported &&
      !this.isAdvertisementProfile &&
      !this.profileSyntaxError &&
      !!this.profileSummary
    );
  }

  createSensorType(): void {
    if (this.sensorDataSetupLocked) {
      return;
    }
    const code = this.newCode.trim();
    const name = this.newName.trim();
    if (!code || !name || !SENSOR_TYPE_CODE_PATTERN.test(code)) {
      this.showError('sensorProfiles.invalidSensorType');
      return;
    }
    const adapterKey =
      this.newIntegrationMode === 'native' ? this.newAdapterKey.trim() : null;
    if (this.newIntegrationMode === 'native' && !adapterKey) {
      this.showError('sensorProfiles.invalidSensorType');
      return;
    }

    this.isBusy = true;
    this.service
      .createSensorType({ code, name, integrationMode: this.newIntegrationMode, adapterKey })
      .pipe(finalize(() => (this.isBusy = false)))
      .subscribe({
        next: (sensorType) => {
          this.sensorTypes = [...this.sensorTypes, sensorType];
          this.newCode = '';
          this.newName = '';
          this.newAdapterKey = '';
          this.selectType(sensorType.id);
          this.showSuccess('sensorProfiles.sensorTypeCreated');
        },
        error: () => this.showError('sensorProfiles.sensorTypeCreateError'),
      });
  }

  deleteSensorType(): void {
    const type = this.selectedType;
    if (
      !type ||
      this.sensorDataSetupLocked ||
      !window.confirm(this.translate.instant('sensorProfiles.deleteConfirm', { name: type.name }))
    ) {
      return;
    }
    this.isBusy = true;
    this.service
      .deleteSensorType(type.id)
      .pipe(finalize(() => (this.isBusy = false)))
      .subscribe({
        next: () => {
          this.sensorTypes = this.sensorTypes.filter((t) => t.id !== type.id);
          this.selectedTypeId = '';
          this.revisions = [];
          this.selectedRevision = undefined;
          if (this.sensorTypes.length) {
            this.selectType(this.sensorTypes[0].id);
          }
          this.showSuccess('sensorProfiles.sensorTypeDeleted');
        },
        error: () => this.showError('sensorProfiles.sensorTypeDeleteError'),
      });
  }

  onProfileJsonChange(source: string): void {
    this.profileJson = source;
    const parsed = parseAndFormatProfileJson(source);
    this.profileSyntaxError = parsed.error ?? '';
    this.profileValidation = undefined;
    this.resetLiveTest();
  }

  formatProfileJson(): void {
    const parsed = parseAndFormatProfileJson(this.profileJson);
    this.profileSyntaxError = parsed.error ?? '';
    if (parsed.formatted) {
      this.profileJson = parsed.formatted;
    }
  }

  importProfile(fileList: FileList | null): void {
    const file = fileList?.item(0);
    if (!file || this.sensorDataSetupLocked) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.onProfileJsonChange(String(reader.result ?? ''));
      this.formatProfileJson();
    };
    reader.onerror = () => this.showError('sensorProfiles.importError');
    reader.readAsText(file);
  }

  validateProfile(): void {
    if (this.sensorDataSetupLocked) {
      return;
    }
    const request = this.buildDraftRequest();
    if (!request || !this.selectedTypeId) {
      return;
    }
    this.isBusy = true;
    const save =
      this.selectedRevision?.status === 'draft'
        ? this.service.updateDraft(this.selectedRevision.id, request)
        : this.service.createDraft(this.selectedTypeId, request);
    save
      .pipe(
        switchMap((revision) => {
          this.selectedRevision = revision;
          return this.service.validateDraft(revision.id);
        }),
        finalize(() => (this.isBusy = false))
      )
      .subscribe({
        next: (result) => {
          this.profileValidation = result;
          this.loadRevisions(false);
        },
        error: () => this.showError('sensorProfiles.validationError'),
      });
  }

  saveDraft(): void {
    if (this.sensorDataSetupLocked) {
      return;
    }
    const request = this.buildDraftRequest();
    if (!request || !this.selectedTypeId) {
      return;
    }
    const operation =
      this.selectedRevision?.status === 'draft'
        ? this.service.updateDraft(this.selectedRevision.id, request)
        : this.service.createDraft(this.selectedTypeId, request);

    this.isBusy = true;
    operation.pipe(finalize(() => (this.isBusy = false))).subscribe({
      next: (revision) => {
        this.selectedRevision = revision;
        this.profileJson = JSON.stringify(revision.spec, null, 2);
        this.loadRevisions();
        this.showSuccess('sensorProfiles.draftSaved');
      },
      error: () => this.showError('sensorProfiles.saveError'),
    });
  }

  openRevision(revision: number): void {
    const profileRevision = this.revisions.find(
      (candidate) => candidate.revision === revision
    );
    if (!profileRevision) {
      return;
    }
    this.isBusy = true;
    this.service
      .getRevision(profileRevision.id)
      .pipe(finalize(() => (this.isBusy = false)))
      .subscribe({
        next: (rev) => {
          this.selectedRevision = rev;
          this.minimumEngineVersion = rev.minEngineVersion;
          this.profileJson = JSON.stringify(rev.spec, null, 2);
          this.profileSyntaxError = '';
          this.profileValidation = undefined;
          this.resetLiveTest();
        },
        error: () => this.showError('sensorProfiles.revisionLoadError'),
      });
  }

  publishDraft(): void {
    const revision = this.selectedRevision;
    if (
      this.sensorDataSetupLocked ||
      !revision ||
      revision.status !== 'draft' ||
      !window.confirm(this.translate.instant('sensorProfiles.publishConfirm'))
    ) {
      return;
    }
    this.runRevisionAction(
      this.service.publish(revision.id),
      'sensorProfiles.published'
    );
  }

  rollbackTo(revision: SensorProfileRevision): void {
    if (
      this.sensorDataSetupLocked ||
      !window.confirm(
        this.translate.instant('sensorProfiles.rollbackConfirm', {
          revision: revision.revision,
        })
      )
    ) {
      return;
    }
    this.runRevisionAction(
      this.service.rollback(revision.sensorTypeId, revision.revision),
      'sensorProfiles.rolledBack'
    );
  }

  integrationModeLabel(mode?: SensorIntegrationMode): string {
    return `sensorProfiles.integrationModes.${mode ?? 'none'}`;
  }

  private resetLiveTest(): void {
    if (this.liveTestDevice) {
      disconnectTestDevice(this.liveTestDevice);
    }
    this.liveTestDevice = undefined;
    this.liveTestDeviceName = '';
    this.liveTestSteps = [];
    this.liveTestError = '';
    this.liveTestBusy = false;
  }

  private loadRevisions(openPreferred = true): void {
    this.isBusy = true;
    this.service
      .listRevisions(this.selectedTypeId)
      .pipe(finalize(() => (this.isBusy = false)))
      .subscribe({
        next: (revisions) => {
          this.revisions = [...revisions].sort(
            (l, r) => r.revision - l.revision
          );
          const preferred =
            this.revisions.find((r) => r.status === 'draft') ??
            this.revisions.find((r) => r.status === 'published');
          if (openPreferred && preferred) {
            this.openRevision(preferred.revision);
          }
        },
        error: () => this.showError('sensorProfiles.revisionsLoadError'),
      });
  }

  private buildDraftRequest(): SensorProfileDraftRequest | undefined {
    const parsed = parseAndFormatProfileJson(this.profileJson);
    this.profileSyntaxError = parsed.error ?? '';
    if (!parsed.value) {
      return undefined;
    }
    return { minEngineVersion: this.minimumEngineVersion.trim(), spec: parsed.value };
  }

  private runRevisionAction(
    operation: Observable<SensorProfileRevision>,
    successKey: string
  ): void {
    this.isBusy = true;
    operation.pipe(finalize(() => (this.isBusy = false))).subscribe({
      next: (revision) => {
        this.selectedRevision = revision;
        this.profileJson = JSON.stringify(revision.spec, null, 2);
        this.loadRevisions();
        this.showSuccess(successKey);
      },
      error: () => this.showError('sensorProfiles.lifecycleError'),
    });
  }

  private showError(key: string): void {
    this.snackbar.open(
      this.translate.instant(key),
      this.translate.instant('sensorProfiles.ok')
    );
  }

  private showSuccess(key: string): void {
    this.snackbar.open(
      this.translate.instant(key),
      this.translate.instant('sensorProfiles.ok'),
      { duration: 3000 }
    );
  }
}
