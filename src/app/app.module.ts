import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { FileSelectDirective } from 'ng2-file-upload';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { ItemCreationComponent } from './item-creation/item-creation.component';
import { HomeDashboardComponent } from './home-dashboard/home-dashboard.component';
import { EmdmCollapsiblePanel } from './core/components/emdm-collapsible-panel.component';
import { EmdmComboBoxComponent } from './core/components/emdm-combobox.component';
import { EmdmDropdownComponent } from './core/components/emdm-dropdown.component';
import { EmdmProgressBarComponent } from './core/components/emdm-progress-bar.component';
import { EmdmModal } from './core/components/emdm-modal.component';
import { EmdmTabComponent } from './core/components/emdm-tab.component';
import { EmdmTabsComponent } from './core/components/emdm-tabs.component';
import { FilterPipe } from './core/pipes/filter.pipe';
import { EllipsisPipe } from './core/pipes/ellipsis.pipe';
import { ItemsAttributeService } from './services/items-attribute.service';
import { ItemsService } from './services/items.service';
import { ManualMatchingItemsService } from './services/manual-matching-items.service';
import { EmdmUtilService } from './services/emdm-util.service';
import { HttpClientService } from './services/http-client.service';
import { ManualMatchingComponent } from './manual-matching/manual-matching.component';
import {PageNotFoundComponent} from './page-not-found/page-not-found.component';
import {ExternalResourcesComponent} from './external-resources/external-resources.component';
import { WorkflowsService } from './services/workflows.service';
import { DataStoreService } from './services/data-store.service';
import { MessageService } from './services/message.service';
import { CommentsComponent } from './comments/comments.component';
import { DisplayItemComponent } from './display-item/display-item.component';
import { SourceInfoComponent } from './source-info/source-info.component';
import { WorklistComponent } from './worklist/worklist.component';
import { ItemSearchComponent } from './item-search/item-search.component';
import { ItemSearchTabViewComponent } from './item-search-tab-view/item-search-tab-view.component';
import { ComboItemComponent } from './combo-item/combo-item.component';
import { ItemFormComponent } from './item-form/item-form.component';
import {DatePipe} from '@angular/common';
import {CalendarModule} from 'primeng/primeng';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { ItemMaintenanceComponent } from './item-maintenance/item-maintenance.component';
import {ManualMatchingOrganizationsService} from './services/manual-matching-organizations.service';
import { EmdmGoToTopComponent } from './core/components/emdm-go-to-top/emdm-go-to-top.component';
import { OrgManualMatchingComponent } from './org/org-manual-matching/org-manual-matching.component';
import { OrgSourceInfoComponent } from './org/org-source-info/org-source-info.component';

const appRoutes: Routes = [
  { path: 'item-creation', component: ItemCreationComponent, data: { mode: 'create' } },
  { path: 'edit-item/draft/:itemSkey', component: ItemCreationComponent, data: { mode: 'editDraft' } },
  { path: 'edit-item/published/:itemSkey', component: ItemCreationComponent, data: { mode: 'editPublished' } },
  { path: 'manual-matching/:workItemsSkey', component: ManualMatchingComponent },
  { path: 'home-dashboard', component: HomeDashboardComponent },
  { path: 'worklist/:workflowModelId/:screenType',  component: WorklistComponent },
  { path: 'item-maintenance',  component: ItemMaintenanceComponent },
  { path: 'org-manual-matching/:workItemsSkey', component: OrgManualMatchingComponent },
  { path: '', redirectTo: 'item-creation', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
  ];

@NgModule({
  declarations: [
    AppComponent,
    ItemCreationComponent,
    HomeDashboardComponent,
    EmdmCollapsiblePanel,
    EmdmComboBoxComponent,
    EmdmDropdownComponent,
    EmdmProgressBarComponent,
    EmdmModal,
    EmdmTabComponent,
    EmdmTabsComponent,
    FilterPipe,
    EllipsisPipe,
    FileSelectDirective,
    ManualMatchingComponent,
    PageNotFoundComponent,
    ExternalResourcesComponent,
    CommentsComponent,
    DisplayItemComponent,
    SourceInfoComponent,
    WorklistComponent,
    ItemSearchComponent,
    ItemSearchTabViewComponent,
    ComboItemComponent,
    ItemFormComponent,
    ItemMaintenanceComponent,
    EmdmGoToTopComponent,
    OrgManualMatchingComponent,
    OrgSourceInfoComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    CalendarModule,
    BrowserAnimationsModule,
    HttpModule,
    RouterModule.forRoot(
      appRoutes,
      { useHash: true }
    )
  ],
  providers: [ 
    ItemsAttributeService, 
    ItemsService, 
    EmdmUtilService, 
    HttpClientService, 
    WorkflowsService, 
    ManualMatchingItemsService, 
    ManualMatchingOrganizationsService,
    DataStoreService,
    MessageService,
    DatePipe
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
