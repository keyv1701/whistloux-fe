import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./shared/components/header/header.component";
import { FooterComponent } from "./shared/components/footer/footer.component";
import { ToastComponent } from "./shared/components/toast/toast.component";
import { ToastService } from "./shared/services/toast.service";
import { AsyncPipe, CommonModule } from "@angular/common";
import { filter } from "rxjs/operators";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ToastComponent, AsyncPipe, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  toast$ = this.toastService.toast$;
  isMigrationPage = false;

  constructor(
    private toastService: ToastService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isMigrationPage = event.url === '/migration' || event.url === '/';
    });
  }

  onToastVisibilityChange(visible: boolean): void {
    if (!visible) {
      this.toastService.clear();
    }
  }
}
