import {ComponentFixture, TestBed} from '@angular/core/testing';

import {GbTreeSearchComponent} from './gb-tree-search.component';
import {TreeModule} from "primeng/tree";
import {AutoCompleteModule, TreeNode} from "primeng/primeng";
import {GbGenericModule} from "../../../gb-generic-module/gb-generic.module";
import {FormsModule} from "@angular/forms";

describe('GbTreeSearchComponent', () => {
  let component: GbTreeSearchComponent;
  let fixture: ComponentFixture<GbTreeSearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GbTreeSearchComponent],
      imports: [
        TreeModule,
        AutoCompleteModule,
        FormsModule,
        GbGenericModule
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(GbTreeSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should count hits', () => {
    component.tree = [
      {label: 'foo'} as TreeNode,
      {label: 'bar'} as TreeNode,
    ];

    component.searchTerm = 'bar';
    component.onFiltering();

    expect(component.hits).toEqual(1);
  });

  it('should highlight found tree nodes', () => {
    let foo = {label: 'foo'} as TreeNode;
    let bar = {label: 'bar'} as TreeNode;
    component.tree = [
      foo,
      bar,
    ];

    component.searchTerm = 'bar';
    component.onFiltering();

    expect(foo.styleClass).toBeUndefined();
    expect(bar.styleClass).toEqual('gb-highlight-treenode');
  });

  it('should collect unique node labels', () => {
    let foo1 = {label: 'foo'} as TreeNode;
    let foo2 = {label: 'foo'} as TreeNode;
    component.tree = [
      foo1,
      foo2,
    ];

    component.searchTerm = 'foo';
    component.onFiltering();

    expect(component.collectedUniqueNodeLabels).toEqual(new Set(['foo']));
  });

  it('should search ignoring case and collect original labels', () => {
    let foo1 = {label: 'foo'} as TreeNode;
    let foo2 = {label: 'FOO'} as TreeNode;
    component.tree = [
      foo1,
      foo2,
    ];

    component.searchTerm = 'foo';
    component.onFiltering();

    expect(component.hits).toEqual(2);
    expect(component.collectedUniqueNodeLabels).toEqual(new Set(['foo', 'FOO']));
  });

  it('should expand ancestor folders of found node', () => {
    let folder1 = {
      label: 'folder1',
      children: [
        {label: 'foo'} as TreeNode,
      ]
    } as TreeNode;
    let folder2 = {
      label: 'folder2',
      children: [
        {label: 'bar'} as TreeNode,
      ]
    } as TreeNode;
    component.tree = [
      folder1,
      folder2,
    ];

    component.searchTerm = 'bar';
    component.onFiltering();

    expect(folder1.expanded).toBeFalsy();
    expect(folder2.expanded).toBeTruthy();
  });

  it('should clear search results and notify parent', () => {
    let spy = spyOn(component.onClear, 'emit');

    component.tree = [
      {label: 'foo'} as TreeNode,
      {label: 'bar'} as TreeNode,
    ];

    component.searchTerm = 'bar';
    component.onFiltering();

    component.clearFilter();

    expect(component.searchTerm).toEqual('');
    expect(component.collectedUniqueNodeLabels).toEqual(new Set());
    expect(component.hits).toEqual(0);
    expect(component.onClear.emit).toHaveBeenCalled();
  });

});
