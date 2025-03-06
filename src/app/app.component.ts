import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./shared/components/header/header.component";
import { FooterComponent } from "./shared/components/footer/footer.component";
import { ToastComponent } from "./shared/components/toast/toast.component";
import { ToastService } from "./shared/services/toast.service";
import { AsyncPipe } from "@angular/common";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ToastComponent, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  toast$ = this.toastService.toast$;

  constructor(private toastService: ToastService) {
  }

  onToastVisibilityChange(visible: boolean): void {
    if (!visible) {
      this.toastService.clear();
    }
  }
}
