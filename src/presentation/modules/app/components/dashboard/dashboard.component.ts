import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { getNavListItems, NavListItem } from './nav-list-items';
import { MatDialog } from '@angular/material/dialog';
import { ChangeAdminPasswordComponent } from '../change-admin-password/change-admin-password.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  isDrawerOpen = true;
  private hideScrollViews = [
    '/respondents',
    '/map',
    '/temperature',
    '/summaries',
    '/sensorDevices',
  ];
  @ViewChild(MatDrawerContent) drawerContent?: MatDrawerContent;
  navigationSubscription?: Subscription;

  navListItems: NavListItem[] = getNavListItems();

  readonly langageDisplayMappings: Record<string, string> = {
    ['en']: 'English',
    ['pl']: 'Polski',
  };
  avatarInitials: string = 'A';

  constructor(
    private translateService: TranslateService,
    @Inject(STORAGE_SERVICE_TOKEN)
    private readonly storage: LocalStorageService,
    @Inject(TOKEN_HANDLER_TOKEN) private readonly tokenHandler: TokenHandler,
    private readonly router: Router,
    private readonly dialog: MatDialog,
    private readonly snackbar: MatSnackBar
  ) {}
  ngOnDestroy(): void {
    this.navigationSubscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.navigationSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.scrollToTop();
      }
    });
    this._language = this.translateService.currentLang;
    this.loadInitials();
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

  toggleDrawer(): void {
    this.isDrawerOpen = !this.isDrawerOpen;
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
}
