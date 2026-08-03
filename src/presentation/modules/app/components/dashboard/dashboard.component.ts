import { Component, HostListener, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from '../../../../../core/services/local-storage';
import {
  STORAGE_SERVICE_TOKEN,
  TOKEN_HANDLER_TOKEN,
} from '../../../../../core/services/injection-tokens';
import { TokenHandler } from '../../../../../core/services/token-handler';
import { NavigationEnd, Router } from '@angular/router';
import { MatDrawerContent } from '@angular/material/sidenav';
import { Subscription } from 'rxjs';
import {
  getNavListItems,
  isNavGroup,
  NavEntry,
  NavGroup,
  NavListItem,
  navGroupContainsLink,
} from './nav-list-items';
import { MatDialog } from '@angular/material/dialog';
import { ChangeAdminPasswordComponent } from '../change-admin-password/change-admin-password.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MapProvider, MapProviderService } from '../../../../../core/services/map-provider.service';

// Below this viewport width the drawer switches to overlay mode and starts closed.
const MOBILE_BREAKPOINT_PX = 768;
// Below this viewport width the app shell stops locking overflow so tables,
// tabs and maps can grow vertically and the page scrolls top-to-bottom. Kept
// in sync with $tablet-breakpoint in styles/variables.scss.
const COMPACT_BREAKPOINT_PX = 1024;

const USER_GUIDE_URL =
  'https://github.com/GeoSenEsm/.github/blob/main/profile/GeoSenEsm__User_Guide.pdf';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  readonly isNavGroup = isNavGroup;

  isDrawerOpen = true;
  isMobile = false;
  isCompact = false;

  private hideScrollViews = [
    '/respondents',
    '/issues',
    '/surveyWindow',
    '/map',
    '/temperature',
    '/summaries',
    '/sensorDevices',
    '/responseDocuments',
    '/statistics',
    '/dailyCompletion',
  ];
  @ViewChild(MatDrawerContent) drawerContent?: MatDrawerContent;
  navigationSubscription?: Subscription;

  navListItems: NavEntry[] = getNavListItems();
  private expandedGroups = new Set<string>();
  readonly toolbarMapProviders: { value: MapProvider; name: string }[] = [
    { value: 'openstreetmap', name: 'OpenStreetMap' },
    { value: 'baidu', name: 'Baidu' },
  ];

  readonly langageDisplayMappings: Record<string, string> = {
    ['en']: 'English',
    ['pl']: 'Polski',
    ['fr']: 'Français',
    ['es']: 'Español',
    ['de']: 'Deutsch',
    ['zh']: '简体中文',
  };
  avatarInitials: string = 'A';

  constructor(
    private translateService: TranslateService,
    @Inject(STORAGE_SERVICE_TOKEN)
    private readonly storage: LocalStorageService,
    @Inject(TOKEN_HANDLER_TOKEN) private readonly tokenHandler: TokenHandler,
    private readonly router: Router,
    private readonly dialog: MatDialog,
    private readonly snackbar: MatSnackBar,
    private readonly mapProviderService: MapProviderService
  ) {}

  ngOnDestroy(): void {
    this.navigationSubscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.updateResponsiveState();
    this.expandGroupForUrl(this.router.url);
    this.navigationSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.expandGroupForUrl(event.urlAfterRedirects);
        this.scrollToTop();
      }
    });
    this._language = this.translateService.currentLang;
    this.loadInitials();
  }

  asNavItem(entry: NavEntry): NavListItem {
    return entry as NavListItem;
  }

  isGroupExpanded(group: NavGroup): boolean {
    return this.expandedGroups.has(group.display);
  }

  setGroupExpanded(group: NavGroup, expanded: boolean): void {
    if (expanded) {
      this.expandedGroups.add(group.display);
    } else {
      this.expandedGroups.delete(group.display);
    }
  }

  private expandGroupForUrl(url: string): void {
    for (const entry of this.navListItems) {
      if (isNavGroup(entry) && navGroupContainsLink(entry, url)) {
        this.expandedGroups.add(entry.display);
      }
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateResponsiveState();
  }

  private updateResponsiveState(): void {
    const width = window.innerWidth;
    const nextIsMobile = width < MOBILE_BREAKPOINT_PX;
    this.isCompact = width < COMPACT_BREAKPOINT_PX;
    if (nextIsMobile !== this.isMobile) {
      this.isMobile = nextIsMobile;
      this.isDrawerOpen = !nextIsMobile;
    } else if (!this.isMobile) {
      this.isDrawerOpen = true;
    }
  }

  private scrollToTop(): void {
    if (this.drawerContent) {
      this.drawerContent
        .getElementRef()
        .nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  get availableLanguages(): string[] {
    return this.translateService.getLangs();
  }

  private _language: string = 'en';

  get language(): string {
    return this._language;
  }

  set language(value: string) {
    this._language = value;
    this.translateService.use(value).subscribe(() => {
      this.snackbar.open(
        this.translateService.instant(
          'app.dashboard.someElementsNeedRefreshing'
        ),
        this.translateService.instant('app.dashboard.ok'),
        {
          duration: 6000,
        }
      );
    });
    this.storage.save('lang', value);
  }

  get selectedMapProvider(): MapProvider {
    return this.mapProviderService.selectedProvider;
  }

  set selectedMapProvider(provider: MapProvider) {
    this.mapProviderService.setProvider(provider);
  }

  toggleDrawer(): void {
    this.isDrawerOpen = !this.isDrawerOpen;
  }

  onNavItemClick(): void {
    if (this.isMobile) {
      this.isDrawerOpen = false;
    }
  }

  private loadInitials(): void {
    const token = this.storage.get<string>('token');

    if (!token) {
      return;
    }

    const username = this.tokenHandler.getClaim(token, 'sub');
    if (typeof username === 'string') {
      this.avatarInitials = username.charAt(0).toUpperCase();
    }
  }

  logout(): void {
    this.storage.remove('token');
    this.router.navigate(['login']);
  }

  shouldHideOverflow(): boolean {
    // On compact viewports (phones and tablets) every route must be top-to-bottom
    // scrollable: filters, tables and tabs stack vertically and routinely exceed
    // the viewport height. Keeping the shell scrollable lets those pages grow
    // naturally instead of being clipped by an app-shell overflow: hidden.
    if (this.isCompact) {
      return false;
    }

    if (this.hideScrollViews.some((e) => this.router.url.startsWith(e))) {
      return true;
    }

    const surveyDetailsRegex =
      /\/surveys\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/;
    return surveyDetailsRegex.test(this.router.url);
  }

  changePassword(): void {
    this.dialog.open(ChangeAdminPasswordComponent);
  }

  openUserGuide(): void {
    window.open(USER_GUIDE_URL, '_blank', 'noopener,noreferrer');
  }
}
