import {ComponentFixture, TestBed} from '@angular/core/testing';

import {GbTreeSearchComponent} from './gb-tree-search.component';
import {TreeModule} from 'primeng/tree';
import {AutoCompleteModule} from 'primeng';
import {GbGenericModule} from '../../../gb-generic-module/gb-generic.module';
import {FormsModule} from '@angular/forms';
import {GbTreeNode} from '../../../../models/tree-node-models/gb-tree-node';

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
      {name: 'foo'} as GbTreeNode,
      {name: 'bar'} as GbTreeNode,
    ];

    component.searchTerm = 'bar';
    component.onFiltering();

    expect(component.hits).toEqual(1);
  });

  it('should highlight found tree nodes', () => {
    let foo = {name: 'foo'} as GbTreeNode;
    let bar = {name: 'bar'} as GbTreeNode;
    component.tree = [
      foo,
      bar,
    ];

    component.searchTerm = 'bar';
    component.onFiltering();

    expect(foo.styleClass).toBeUndefined();
    expect(bar.styleClass).toEqual('gb-highlight-treenode');
  });

  it('should collect unique node names', () => {
    let foo1 = {name: 'foo'} as GbTreeNode;
    let foo2 = {name: 'foo'} as GbTreeNode;
    component.tree = [
      foo1,
      foo2,
    ];

    component.searchTerm = 'foo';
    component.onFiltering();

    expect(component.collectedUniqueNodeNames).toEqual(new Set(['foo']));
  });

  it('should search ignoring case and collect original names', () => {
    let foo1 = {name: 'foo'} as GbTreeNode;
    let foo2 = {name: 'FOO'} as GbTreeNode;
    component.tree = [
      foo1,
      foo2,
    ];

    component.searchTerm = 'foo';
    component.onFiltering();

    expect(component.hits).toEqual(2);
    expect(component.collectedUniqueNodeNames).toEqual(new Set(['foo', 'FOO']));
  });

  it('should expand ancestor folders of found node', () => {
    let folder1 = {
      name: 'folder1',
      children: [
        {name: 'foo'} as GbTreeNode,
      ]
    } as GbTreeNode;
    let folder2 = {
      name: 'folder2',
      children: [
        {name: 'bar'} as GbTreeNode,
      ]
    } as GbTreeNode;
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
    component.tree = [
      {name: 'foo'} as GbTreeNode,
      {name: 'bar'} as GbTreeNode,
    ];

    component.searchTerm = 'bar';
    component.onFiltering();

    component.clearFilter();

    expect(component.searchTerm).toEqual('');
    expect(component.collectedUniqueNodeNames).toEqual(new Set());
    expect(component.hits).toEqual(0);
  });

});
